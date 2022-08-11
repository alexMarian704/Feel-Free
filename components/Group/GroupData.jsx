import React, { useRef, useState, useEffect } from 'react'
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCheck } from "@fortawesome/free-solid-svg-icons";
import { Moralis } from "moralis";
import style from "../../styles/Group.module.css"
import { useMoralis } from "react-moralis";
import AES from 'crypto-js/aes';
import ENC from 'crypto-js/enc-utf8'

const GroupData = ({ selectFriend }) => {
    const { user } = useMoralis();
    const fileRef = useRef();
    const [image, setImage] = useState("")
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [error, setError] = useState("")
    const [friendsData , setFriendsData] = useState([])

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

    const decrypt = (crypted, password) => JSON.parse(AES.decrypt(crypted, password).toString(ENC)).content
    const encrypt = (content, password) => AES.encrypt(JSON.stringify({ content }), password).toString()

    const createGroup = async () => {
        if (name.length > 3 && description.length > 6) {
            setError("")
            const d = new Date();
            let time = d.getTime();
            const ref = `a${user.get("ethAddress").slice(2)}${time}`
            const keyPair = window.crypto.subtle.generateKey({
                name: "RSA-OAEP",
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            },
                true,
                ["encrypt", "decrypt"]
            );
            const { privateKey } = await keyPair;
            const privateKeyJwk = await window.crypto.subtle.exportKey(
                "jwk",
                privateKey
            );
            const stringKey = JSON.stringify(privateKeyJwk)

            const GroupOrigin = Moralis.Object.extend(ref);
            const groupData = new GroupOrigin();
            groupData.save({
                type: "data",
                owner: user.get("ethAddress"),
                name: name,
                description: description,
                image: image,
                time: time,
            });
            const messageACL = new Moralis.ACL();
            messageACL.setWriteAccess(user.id, true);
            messageACL.setReadAccess(user.id, true)
            for (let i = 0; i < friendsData.length; i++) {
                messageACL.setReadAccess(friendsData[i].idUser, true);
            }
            console.log(messageACL)
            groupData.setACL(messageACL)
            groupData.save();

        } else if (name.length <= 3) {
            setError("Name is too short")
        } else {
            setError("Description is too short")
        }
    }



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
                    {error !== "" && <p>{error}</p>}
                </div>
            </div>
            <button className={style.createButton} onClick={createGroup}>
                <FontAwesomeIcon icon={faCheck} />
            </button>
        </div>
    )
}

export default GroupData