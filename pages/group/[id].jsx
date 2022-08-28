import { useRouter } from "next/router";
import React, { useState, useEffect, useRef } from 'react'
import { useInternetConnection } from "../../function/hooks/useInternetConnection";
import OfflineNotification from "../../components/OfflineNotification";
import Head from "next/head";
import { useMoralis } from "react-moralis";
import Reject from "../../components/Reject";
import ConfigAccount from "../../components/ConfigAccount";
import { Moralis } from "moralis";
import style from "../../styles/GroupChat.module.css"
import CheckPassword from "../../components/CheckPassword";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeartBroken, faHouseUser, faArrowLeft, faPaperPlane, faPaperclip } from "@fortawesome/free-solid-svg-icons";
import AES from 'crypto-js/aes';
import ENC from 'crypto-js/enc-utf8'
import { messageOrder } from "../../function/messageOrder";
import styleChat from "../../styles/Messages.module.css"
import RenderGroupMessage from "../../components/MessageGroup";
import GroupOptions from "../../components/Group/GroupOptions";

const Group = () => {
    const [member, setMember] = useState(true)
    const [loading, setLoading] = useState(true);
    const [groupData, setGroupData] = useState("")
    const [message, setMessage] = useState("")
    const [localMessages, setLocalMessages] = useState([])
    const [render, setRender] = useState(100);
    const [reply, setReply] = useState("")
    const [initial, setInitial] = useState([])
    const { isAuthenticated, user } = useMoralis();
    const router = useRouter()
    const fileRef = useRef()
    const internetStatus = useInternetConnection()
    const [positionScroll, setPositionScroll] = useState(1);
    const messageRef = useRef();
    const [openReply, setOpenReply] = useState(-1);
    const [open, setOpen] = useState(false);
    const [scrollIntoViewIndicator, setScrollIntoViewIndicator] = useState("");

    function _base64ToArrayBuffer(base64) {
        let binary_string = window.atob(base64);
        let len = binary_string.length;
        let bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    const encrypt = (content, password) => AES.encrypt(JSON.stringify({ content }), password).toString()
    const decrypt = (crypted, password) => JSON.parse(AES.decrypt(crypted, password).toString(ENC)).content

    const unredMessages = async () => {
        if (isAuthenticated && router.query.mesID) {
            let messageList = []
            let main = {
                userAddress: user.get("ethAddress"),
                messages: messageList
            }
            const GroupMessage = Moralis.Object.extend(`Group${router.query.id}`);
            const query = new Moralis.Query(GroupMessage);
            query.equalTo("type", "Message");
            const results = await query.find();
            deleteNotification();
            if (results !== undefined) {
                for (let i = 0; i < results.length; i++) {
                    if (JSON.parse(localStorage.getItem(`Group${router.query.id}Messages`) !== null)) {
                        const encryptedMessages = localStorage.getItem(`Group${router.query.id}Messages`)
                        const decryptedMessages = decrypt(encryptedMessages, user.id);
                        main.messages = decryptedMessages.messages
                    }
                    const encryptKey = decrypt(localStorage.getItem(`Group${router.query.id}Key`), user.id)
                    const decryptMessage = decrypt(results[i].attributes.message, encryptKey)
                    const decryptReply = decrypt(results[i].attributes.reply, encryptKey)
                    main.messages.push({ type: results[i].attributes.tag, message: decryptMessage, time: results[i].attributes.time, file: results[i].attributes.file, fileName: results[i].attributes.fileName, reply: decryptReply })

                    const encryptedMessagesList = encrypt(main, user.id)
                    localStorage.setItem(`Group${router.query.id}Messages`, encryptedMessagesList);
                    console.log(main.messages)
                }
                for (let i = 0; i < results.length; i++) {
                    if (results[i].attributes.seen + 1 === results[i].attributes.membersNumber) {
                        const query1 = new Moralis.Query(GroupMessage);
                        query1.equalTo("time", results[i].attributes.time);
                        query1.equalTo("type", "Message")
                        const results1 = await query1.first();
                        if (results1 !== undefined)
                            results1.destroy()
                    } else {
                        results[i].set({
                            seen: results[i].attributes.seen + 1
                        })
                        results[i].save();
                    }
                }
                if (main.messages.length > 0) {
                    setLocalMessages(main.messages)
                    messageRef.current.scrollIntoView({ behavior: 'instant' })
                }
            }
        }
    }

    const deleteNotification = async () => {
        const userNotification = Moralis.Object.extend("Notification");
        const query = new Moralis.Query(userNotification);
        query.equalTo("url", router.query.mesID);
        query.equalTo("type", "Group message");
        query.equalTo("to", user.get("ethAddress"));
        const results = await query.first();
        if (results !== undefined) {
            results.destroy()
        }
    }


    useEffect(async () => {
        if (isAuthenticated && router.query.id) {
            const GroupMembers = Moralis.Object.extend(`Group${router.query.id}`);
            const query = new Moralis.Query(GroupMembers);
            query.equalTo("type", "data");
            const _results = await query.first();
            if (_results === undefined) {
                setMember(false)
            } else {
                setGroupData(_results.attributes)
            }
            setLoading(false)
            if (localStorage.getItem(`Group${router.query.id}Key`) === null) {
                const GroupKey = Moralis.Object.extend(`Group${router.query.id}`);
                const query = new Moralis.Query(GroupKey);
                query.equalTo("type", "Encryption key");
                query.equalTo("to", user.get("ethAddress"));
                const results = await query.first();
                if (results !== undefined) {
                    const dec = new TextDecoder();
                    const encryptedPrivateKey = localStorage.getItem(`privateKeyUser${user.get("ethAddress")}`)
                    const decryptedPrivateKEy = decrypt(encryptedPrivateKey, user.id);
                    const originPrivateKey = await window.crypto.subtle.importKey(
                        "jwk",
                        decryptedPrivateKEy,
                        {
                            name: "RSA-OAEP",
                            modulusLength: 4096,
                            hash: "SHA-256"
                        },
                        true,
                        ["decrypt"]
                    );
                    const bufferKey = _base64ToArrayBuffer(results.attributes.key)
                    const decryptedKey = await window.crypto.subtle.decrypt({
                        name: "RSA-OAEP"
                    },
                        originPrivateKey,
                        bufferKey
                    )
                    const textKey = dec.decode(decryptedKey)
                    console.log(textKey)
                    const localEncrypt = encrypt(textKey, user.id)
                    localStorage.setItem(`Group${router.query.id}Key`, localEncrypt)
                    results.destroy()
                    const groupsList = localStorage.getItem("GroupsList")
                    if (groupsList !== null)
                        localStorage.setItem("GroupsList", JSON.stringify([...JSON.parse(groupsList), `Group${router.query.id}`]));
                    else
                        localStorage.setItem("GroupsList", JSON.stringify([`Group${router.query.id}`]));
                    messageOrder(user.get("ethAddress"), _results.attributes.name, "New group", _results.attributes.name, "", _results.attributes.time, "friend", "message", null, "group", router.query.id)
                }
            }
            const userNotification = Moralis.Object.extend("Notification");
            const queryNotification = new Moralis.Query(userNotification);
            queryNotification.equalTo("to", user.get("ethAddress"));
            queryNotification.equalTo("type", "New group");
            queryNotification.equalTo("time", _results.attributes.time);
            const results1 = await queryNotification.first();
            if (results1 !== undefined)
                results1.destroy()
        }
    }, [isAuthenticated, router.query.id])

    const getLocalMessages = () => {
        if (isAuthenticated && router.query.id) {
            if (JSON.parse(localStorage.getItem(`Group${router.query.id}Messages`) !== null)) {
                const encryptedMessages = localStorage.getItem(`Group${router.query.id}Messages`)
                const decryptedMessages = decrypt(encryptedMessages, user.id);
                setLocalMessages(decryptedMessages.messages)
                setInitial(decryptedMessages.messages)
            }
        }
    }

    useEffect(() => {
        if (messageRef.current !== undefined) {
            messageRef.current.scrollIntoView({ behavior: 'instant' })
            setLoading(false);
        } else if (isAuthenticated && router.query.id) {
            if (localStorage.getItem(`Group${router.query.id}Messages`) === null)
                setLoading(false);
        }
    }, [router.query.id, isAuthenticated, initial])

    useEffect(() => {
        getLocalMessages()
    }, [isAuthenticated, router.query.id])

    if (!isAuthenticated) {
        return <Reject />;
    } else if (
        user.get("userNameChange") === undefined ||
        user.get("userNameChange") === false || user.get("passwordConfig") === undefined ||
        user.get("passwordConfig") === false
    ) {
        return <ConfigAccount />;
    }
    if (user.get("reCheck") === 1) return <CheckPassword />
    if (member === false)
        return (
            <div style={{
                "paddingTop": "100px",
                "fontSize": "calc(22px + 1vw)",
            }}>
                <h2 className={style.foundError}>Group not found</h2>
                <h2 className={style.foundError}><FontAwesomeIcon icon={faHeartBroken} /></h2>
                <button className={style.backToHome} onClick={() => router.push("/")} >Back to <FontAwesomeIcon icon={faHouseUser} /></button>
            </div>
        )

    const pushMessage = async (file, fileName, message) => {
        if (message.trim() !== "") {
            const d = new Date();
            let time = d.getTime();
            let main = {
                userAddress: user.get("ethAddress"),
                messages: []
            }

            const encryptKey = decrypt(localStorage.getItem(`Group${router.query.id}Key`), user.id)
            const encryptMessage = encrypt(message, encryptKey)
            const encryptReply = encrypt(reply, encryptKey)

            if (JSON.parse(localStorage.getItem(`Group${router.query.id}Messages`) !== null)) {
                const encryptedMessages = localStorage.getItem(`Group${router.query.id}Messages`)
                const decryptedMessages = decrypt(encryptedMessages, user.id);
                main.messages = decryptedMessages.messages
            }
            main.messages.push({ type: user.get("userTag"), message: message, time: time, seen: [], file: file, fileName: fileName, reply: reply })
            console.log(main.messages)

            setLocalMessages(main.messages)

            const encryptedMessagesList = encrypt(main, user.id)
            localStorage.setItem(`Group${router.query.id}Messages`, encryptedMessagesList);
            messageOrder(user.get("ethAddress"), groupData.name, message, groupData.name, "", time, user.get("userTag"), file, groupData.members, "group", router.query.id)

            const MessageOrigin = Moralis.Object.extend(`Group${router.query.id}`);
            const messageOriginPush = new MessageOrigin();
            messageOriginPush.save({
                from: user.get("ethAddress"),
                message: encryptMessage,
                time: time,
                file: file,
                fileName: fileName,
                tag: user.get("userTag"),
                reply: encryptReply,
                type: "Message",
                seen: 1,
                membersNumber: groupData.members.length
            });
            const messageACL = new Moralis.ACL();
            messageACL.setWriteAccess(user.id, true);
            messageACL.setReadAccess(user.id, true)
            for (let i = 0; i < groupData.members.length; i++) {
                const addressToTag = Moralis.Object.extend("Tags");
                const query = new Moralis.Query(addressToTag);
                query.equalTo("ethAddress", groupData.members[i]);
                const results = await query.first();
                if (results !== undefined) {
                    messageACL.setWriteAccess(results.attributes.idUser, true);
                    messageACL.setReadAccess(results.attributes.idUser, true);
                }
            }
            messageOriginPush.setACL(messageACL)
            messageOriginPush.save();
            pushNotification()
            setMessage("")

            if (main.messages.length > 0) {
                setRender(++render);
                messageRef.current.scrollIntoView({ behavior: 'smooth' })
            }
        }
    }

    const pushNotification = async () => {
        for (let i = 0; i < groupData.members.length; i++) {
            if (groupData.members[i] !== user.get("ethAddress")) {
                const userNotification = Moralis.Object.extend("Notification");
                const query = new Moralis.Query(userNotification);
                query.equalTo("to", groupData.members[i]);
                //query.equalTo("tag", user.get("userTag"));
                query.equalTo("type", "Group message");
                query.equalTo("url", router.query.id);
                const results = await query.first();

                if (results === undefined) {
                    const addressToTag = Moralis.Object.extend("Tags");
                    const _query = new Moralis.Query(addressToTag);
                    _query.equalTo("ethAddress", groupData.members[i]);
                    const _results = await _query.first();

                    const d = new Date();
                    let time = d.getTime();

                    const Notification = Moralis.Object.extend("Notification");
                    const noti = new Notification();
                    noti.save({
                        from: user.get("ethAddress"),
                        to: groupData.members[i],
                        type: "Group message",
                        tag: user.get("userTag"),
                        url: router.query.id,
                        time: time,
                        name: groupData.name
                    });

                    const notificationsACL = new Moralis.ACL();
                    notificationsACL.setWriteAccess(user.id, true);
                    notificationsACL.setReadAccess(user.id, true)
                    notificationsACL.setWriteAccess(_results.attributes.idUser, true);
                    notificationsACL.setReadAccess(_results.attributes.idUser, true);
                    noti.setACL(notificationsACL)
                    noti.save();
                }
            }
        }
    }

    const sendImage = async (e) => {
        const file = e.target.files[0];
        const imageMessage = new Moralis.File(file.name, file);
        await imageMessage.saveIPFS();

        console.log(imageMessage.ipfs())

        pushMessage(file.type, file.name, imageMessage.ipfs());
    }

    const handleScroll = (e) => {
        const element = e.currentTarget;
        const position = element.scrollTop / (element.scrollHeight - element.clientHeight);
        if (Math.abs(positionScroll - position) >= 0.02)
            setPositionScroll(Number(position.toPrecision(2)))
    };

    // console.log(groupData)

    return (
        <div>
            <div className={style.nav}>
                {groupData !== "" && <div className={style.groupInfo}>
                    <button onClick={() => router.push("/")} className={style.backBut}><FontAwesomeIcon icon={faArrowLeft} /></button>
                    <div className={style.data}>
                        <h2>{groupData.name}</h2>
                        <p>{groupData.members.length} members</p>
                    </div>
                </div>}
                <GroupOptions />
            </div>
            <div className={styleChat.messageContainer} onClick={() => setOpen(false)} style={reply === "" ? { height: "calc(97.2vh - 125px)" } : { height: "calc(95.4vh - 162px)" }} onScroll={handleScroll} id="scrollID">
                {localMessages.length > 0 && localMessages.map((message, i) => {
                    const d = new Date(message.time);
                    let day = d.getDate()
                    let month = d.getMonth();
                    let year = d.getFullYear()
                    const prevTime = new Date(i > 0 ? localMessages[i - 1].time : null);
                    let dayP = prevTime.getDate()
                    let monthP = prevTime.getMonth();
                    let yearP = prevTime.getFullYear()
                    if (i >= localMessages.length - render - 1)
                        return (
                            <div key={i}>
                                {(day !== dayP || month !== monthP || year !== yearP) &&
                                    <div>
                                        <p className={styleChat.chatDate}>{day}.{month + 1}.{year}</p>
                                    </div>}
                                <RenderGroupMessage message={message} refMes={messageRef} number={i} total={localMessages.length} setReply={setReply} openReply={openReply} setOpenReply={setOpenReply} scrollIntoViewIndicator={scrollIntoViewIndicator} setScrollIntoViewIndicator={setScrollIntoViewIndicator} />
                            </div>
                        )
                })}
            </div>
            <div className={styleChat.sendContainer}>
                <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a message" onKeyPress={e => {
                    if (e.key === "Enter") {
                        pushMessage("message", "message", message);
                        setReply("");
                    }
                }} />
                <button onClick={() => { pushMessage("message", "message", message), setReply("") }}><FontAwesomeIcon icon={faPaperPlane} /></button>
                <button onClick={() => {
                    fileRef.current.click();
                }}><FontAwesomeIcon icon={faPaperclip} /></button>
                <input
                    type="file"
                    onChange={sendImage}
                    ref={fileRef}
                    style={{
                        display: "none",
                    }}
                />
            </div>
            {internetStatus === false && <OfflineNotification />}
        </div>

    )
}

export default Group