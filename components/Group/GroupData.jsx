import React, { useRef, useState, useEffect } from 'react'
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCheck } from "@fortawesome/free-solid-svg-icons";
import { Moralis } from "moralis";
import style from "../../styles/Group.module.css"
import { useMoralis } from "react-moralis";
import AES from 'crypto-js/aes';
import ENC from 'crypto-js/enc-utf8'
import { messageOrder } from '../../function/messageOrder';
import { useRouter } from "next/router";

const GroupData = ({ selectFriend }) => {
    const { user } = useMoralis();
    const fileRef = useRef();
    const router = useRouter()
    const [image, setImage] = useState("")
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [error, setError] = useState("")
    const [friendsData, setFriendsData] = useState([])
    const [creatingLoading , setCreatingLoading] = useState(false);

    const changePhoto = async (e) => {
        const file = e.target.files[0];
        const type = e.target.files[0].type.replace("image/", "");
        const name = `profile.${type}`;
        const groupImage = new Moralis.File(name, file);
        await groupImage.saveIPFS();
        setImage(groupImage.ipfs())
        console.log(groupImage.ipfs());
    };

    useEffect(async () => {
        let array = []
        for (let i = 0; i < selectFriend.length; i++) {
            const addressToTag = Moralis.Object.extend("Tags");
            const query = new Moralis.Query(addressToTag);
            query.equalTo("ethAddress", selectFriend[i]);
            const results = await query.first();
            if (results !== undefined) {
                array.push(results.attributes);
            }
        }
        setFriendsData(array);
    }, [])

    function _arrayBufferToBase64(buffer) {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    //console.log(friendsData)

    const decrypt = (crypted, password) => JSON.parse(AES.decrypt(crypted, password).toString(ENC)).content
    const encrypt = (content, password) => AES.encrypt(JSON.stringify({ content }), password).toString()

    const createGroup = async () => {
        if (name.length > 3 && description.length > 6 && image !== "") {
            setError("")
            const d = new Date();
            let time = d.getTime();
            const ref = `Group${user.get("ethAddress").slice(2)}${time}`
            const stringKey = self.crypto.randomUUID()
            const enc = new TextEncoder();
            const encodedKey = enc.encode(stringKey);

            const GroupOrigin = Moralis.Object.extend(ref);
            const groupData = new GroupOrigin();
            groupData.save({
                type: "data",
                owner: user.get("ethAddress"),
                name: name.trim(),
                description: description.trim(),
                image: image,
                time: time,
                members: selectFriend
            });
            const originACL = new Moralis.ACL();
            originACL.setWriteAccess(user.id, true);
            originACL.setReadAccess(user.id, true)
            for (let i = 0; i < friendsData.length; i++) {
                originACL.setReadAccess(friendsData[i].idUser, true);
            }
            groupData.setACL(originACL)
            groupData.save();
            for (let i = 0; i < friendsData.length; i++) {
                const publicKeyFriend = JSON.parse(friendsData[i].formatPublicKey)
                const publicKey = await window.crypto.subtle.importKey(
                    "jwk",
                    publicKeyFriend,
                    {
                        name: "RSA-OAEP",
                        modulusLength: 4096,
                        hash: "SHA-256"
                    },
                    true,
                    ["encrypt"]
                );

                const encryptedKey = await window.crypto.subtle.encrypt({
                    name: "RSA-OAEP"
                },
                    publicKey,
                    encodedKey
                ).catch((err) => {
                    console.log(err)
                })
                const GroupKey = Moralis.Object.extend(ref);
                const groupData = new GroupKey();
                groupData.save({
                    from: user.get("ethAddress"),
                    to: friendsData[i].ethAddress,
                    type: "Encryption key",
                    time: time,
                    key: _arrayBufferToBase64(encryptedKey)
                });
                const groupACL = new Moralis.ACL();
                groupACL.setWriteAccess(user.id, true);
                groupACL.setReadAccess(user.id, true)
                groupACL.setWriteAccess(friendsData[i].idUser, true);
                groupACL.setReadAccess(friendsData[i].idUser, true)
                groupData.setACL(groupACL)
                groupData.save();

                const Notification = Moralis.Object.extend("Notification");
                const noti = new Notification();
                noti.save({
                    from: user.get("ethAddress"),
                    to: friendsData[i].ethAddress,
                    type: "New group",
                    time: time,
                    name: name.trim(),
                    tag: user.get("userTag")
                });

                const notificationsACL = new Moralis.ACL();
                notificationsACL.setWriteAccess(user.id, true);
                notificationsACL.setReadAccess(user.id, true)
                notificationsACL.setWriteAccess(friendsData[i].idUser, true);
                notificationsACL.setReadAccess(friendsData[i].idUser, true);
                noti.setACL(notificationsACL)
                noti.save();
            }
            const encryptedLocalKey = encrypt(stringKey, user.id)
            localStorage.setItem(`Group${user.get("ethAddress").slice(2)}${time}Key`, encryptedLocalKey);
            const groupsList = localStorage.getItem("GroupsList")
            if (groupsList !== null)
                localStorage.setItem("GroupsList", JSON.stringify([...JSON.parse(groupsList), `Group${user.get("ethAddress").slice(2)}${time}`]));
            else
                localStorage.setItem("GroupsList", JSON.stringify([`Group${user.get("ethAddress").slice(2)}${time}`]));
            messageOrder(user.get("ethAddress"), name.trim(), "New group", name.trim(), "", time, "you", "message", null, "group", user.get("ethAddress").slice(2) + time)
            setCreatingLoading(true)
            setTimeout(() => {
                router.push(`/group/${user.get("ethAddress").slice(2)}${time}`)
              }, 1000)
        } else if (name.trim().length <= 3) {
            setError("Name is too short, it has to be at least 4 characters")
        }else if (image === "") {
            setError("Please select an image")
        } else if(description.trim().length <= 7) {
            setError("Description is too short, it has to be at least 8 characters")
        }
    }

    console.log(name.trim())


    return (
        <div>
            <div>
                <div className={style.imageContainer}>
                    {image !== "" && (
                        <Image
                            src={image}
                            alt="group image"
                            width="90%"
                            height="90%"
                            layout="fill"
                            objectFit="cover"
                            className={style.img}
                        />
                    )}
                    {image === "" &&
                        <div>
                            <p>Select group image</p>
                        </div>}
                    <button
                        onClick={() => {
                            fileRef.current.click();
                        }}
                        className={style.change}
                    >
                        <FontAwesomeIcon icon={faCamera} color="white" />
                    </button>
                    <input
                        type="file"
                        onChange={changePhoto}
                        ref={fileRef}
                        style={{
                            display: "none",
                        }}
                    />
                </div>
                <div className={style.info}>
                    <div>
                        <label>Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                </div>
                <div className={style.info}>
                    <div>
                        <label>Description</label>
                        <textarea name="description" cols="30" rows="10" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                    </div>
                </div>
                <div>
                    {error !== "" && <p className={style.error}>{error}</p>}
                </div>
            </div>
            <button className={style.createButton} onClick={createGroup}>
                <FontAwesomeIcon icon={faCheck} />
            </button>
        </div>
    )
}

export default GroupData