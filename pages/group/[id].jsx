import { useRouter } from "next/router";
import React, { useState, useEffect } from 'react'
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
import { faHeartBroken, faHouseUser } from "@fortawesome/free-solid-svg-icons";
import AES from 'crypto-js/aes';
import ENC from 'crypto-js/enc-utf8'
import { messageOrder } from "../../function/messageOrder";

const Group = () => {
    const [member, setMember] = useState(true)
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, user } = useMoralis();
    const router = useRouter()
    const internetStatus = useInternetConnection()

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

    useEffect(async () => {
        if (isAuthenticated && router.query.id) {
            const GroupMembers = Moralis.Object.extend(`Group${router.query.id}`);
            const query = new Moralis.Query(GroupMembers);
            query.equalTo("type", "data");
            const _results = await query.first();
            if (_results === undefined) {
                setMember(false)
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
            results1.destroy()
        }
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

    return (
        <div>
            {loading === false && <div>
                {router.query.id}
                {internetStatus === false && <OfflineNotification />}
            </div>}
        </div>

    )
}

export default Group