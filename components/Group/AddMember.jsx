import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Moralis } from "moralis";
import { useMoralis } from "react-moralis";
import FriendData from './FriendData';
import styleFriend from "../../styles/Group.module.css"
import AES from 'crypto-js/aes';
import ENC from 'crypto-js/enc-utf8'
import { useRouter } from "next/router";

const AddMember = ({ setAddMember, group, members, style }) => {
    const { user } = useMoralis();
    const [friendList, setFriendList] = useState([])
    const [selectFriend, setSelectFriend] = useState([])
    const router = useRouter()

    const getFriend = async () => {
        const UserFriends = Moralis.Object.extend("Friends");
        const query = new Moralis.Query(UserFriends);
        query.equalTo("ethAddress", user.get("ethAddress"));
        const result = await query.first();
        if (result.attributes.friendsArray.length > 0) {
            let array = []
            const addressToTag = Moralis.Object.extend("Tags");
            const query_ = new Moralis.Query(addressToTag);
            query_.containedIn("ethAddress", result.attributes.friendsArray)
            query_.find().then((res) => {
                for(let i=0;i<res.length;i++){
                    array.push(res[i].attributes)
                }
                setFriendList(array.filter((x) => members.includes(x.ethAddress) === false));
            });
        }
    }

    useEffect(() => {
        getFriend()
    }, [])

    const decrypt = (crypted, password) => JSON.parse(AES.decrypt(crypted, password).toString(ENC)).content

    function _arrayBufferToBase64(buffer) {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    function generateRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    const select = (eth) => {
        if (selectFriend.includes(eth) === false) {
            setSelectFriend([...selectFriend, eth])
        } else {
            setSelectFriend(selectFriend.filter((x) => x !== eth))
        }
    }

    const add = async () => {
        const d = new Date();
        let time = d.getTime();

        const encryptKey = decrypt(localStorage.getItem(`Group${group}Key`), user.id)
        const enc = new TextEncoder();
        const encodedKey = enc.encode(encryptKey);

        let filterFriends = friendList.filter((x) => selectFriend.includes(x.ethAddress))

        const GroupData = Moralis.Object.extend(`Group${group}`);
        const query = new Moralis.Query(GroupData);
        query.equalTo("type", "data");
        const results = await query.first();

        const groupACL = new Moralis.ACL(results.attributes.ACL.permissionsById);

        let colors = [];
        for (let i = 0; i < filterFriends.length; i++) {
            colors.push(filterFriends[i].userTag)
            let color = generateRandomColor()
            while (results.attributes.colors.includes(color))
                color = generateRandomColor()
            colors.push(color)

            groupACL.setReadAccess(filterFriends[i].idUser, true);
        }

        for (let i = 0; i < filterFriends.length; i++) {
            const publicKeyFriend = JSON.parse(filterFriends[i].formatPublicKey)
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

            const GroupKey = Moralis.Object.extend(`Group${group}`);
            const groupData = new GroupKey();
            groupData.save({
                from: user.get("ethAddress"),
                to: filterFriends[i].ethAddress,
                type: "Encryption key",
                time: results.attributes.time,
                key: _arrayBufferToBase64(encryptedKey)
            });
            const groupKeyACL = new Moralis.ACL();
            groupKeyACL.setWriteAccess(user.id, true);
            groupKeyACL.setReadAccess(user.id, true)
            groupKeyACL.setWriteAccess(filterFriends[i].idUser, true);
            groupKeyACL.setReadAccess(filterFriends[i].idUser, true)
            groupData.setACL(groupKeyACL)
            groupData.save();

            const Notification = Moralis.Object.extend("Notification");
            const noti = new Notification();
            noti.save({
                from: user.get("ethAddress"),
                to: filterFriends[i].ethAddress,
                type: "New group",
                time: results.attributes.time,
                name: results.attributes.name,
                tag: user.get("userTag")
            });

            const notificationsACL = new Moralis.ACL();
            notificationsACL.setWriteAccess(user.id, true);
            notificationsACL.setReadAccess(user.id, true)
            notificationsACL.setWriteAccess(filterFriends[i].idUser, true);
            notificationsACL.setReadAccess(filterFriends[i].idUser, true);
            noti.setACL(notificationsACL)
            noti.save();
        }

        results.set("colors", [...results.attributes.colors, ...colors]);
        results.set("members", [...results.attributes.members, ...selectFriend]);
        results.setACL(groupACL)
        results.save();
        Moralis.LiveQuery.close()
        router.push(`/group/${group}`);
    }

    return (
        <div className={style.addMemberContainer}>
            <div className={style.nav}>
                <div className={style.groupInfo}>
                    <button onClick={() => setAddMember(false)} className={style.backBut}><FontAwesomeIcon icon={faArrowLeft} /></button>
                    <div className={style.data}>
                        <h2>Add members</h2>
                    </div>
                </div>
            </div>
            <div>
                {friendList.length > 0 &&
                    <div>
                        {friendList.map((friend, i) => {
                            return (
                                <FriendData friend={friend} style={styleFriend} select={select} selectFriend={selectFriend} key={friend.userTag} />
                            )
                        })}
                    </div>}
            </div>
            {selectFriend.length > 0 && <button onClick={add} className={style.addMembersButton}><FontAwesomeIcon icon={faPlus} /></button>}
        </div>
    )
}

export default AddMember