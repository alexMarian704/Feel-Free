import React, { useState, useEffect } from "react";
import Nav from '../../components/Nav';
import Head from "next/head";
import { useMoralis } from "react-moralis";
import Reject from "../../components/Reject";
import ConfigAccount from "../../components/ConfigAccount";
import { Moralis } from "moralis";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProfilePicture from "../../public/profile.jpg";
import { faPaperPlane, faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/router';
import style from "../../styles/Messages.module.css"
import AES from 'crypto-js/aes';
import ENC from 'crypto-js/enc-utf8'

export default function Messages() {
  const { isAuthenticated, user, setUserData } = useMoralis();
  const router = useRouter()
  const [message, setMessage] = useState("");
  const [value, setValue] = useState("")

  if (!isAuthenticated) {
    return <Reject />;
  } else if (
    user.get("userNameChange") === undefined ||
    user.get("userNameChange") === false
  ) {
    return <ConfigAccount />;
  }
  if (user.get("reCheck") === 1) return <CheckPassword />

  if (user && router.query.mesID === user.get("ethAddress")) router.push("/")

  const sendImage = async () => {

  }

  function _arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function _base64ToArrayBuffer(base64) {
    let binary_string = window.atob(base64);
    let len = binary_string.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}


  const pushMessage = async () => {
    const addressToTag = Moralis.Object.extend("Tags");
    const query = new Moralis.Query(addressToTag);
    query.equalTo("ethAddress", router.query.mesID);
    const results = await query.first();
    const publicKeyEncrypt = JSON.parse(results.attributes.formatPublicKey)

    const enc = new TextEncoder();
    const encodedMessage = enc.encode(message);
    const originPublicKey = await window.crypto.subtle.importKey(
      "jwk",
      publicKeyEncrypt,
      {
        name: "RSA-OAEP",
        modulusLength: 4096,
        hash: "SHA-256"
      },
      true,
      ["encrypt"]
    );

    const encryptedText = await window.crypto.subtle.encrypt({
      name: "RSA-OAEP"
    },
      originPublicKey,
      encodedMessage
    )
    const base64Text = _arrayBufferToBase64(encryptedText)
    if (router.query.mesID.localeCompare(user.get("ethAddress")) === 1) {
      console.log(router.query.mesID)
      const ref = `${router.query.mesID.slice(2)}${user.get("ethAddress").slice(2)}`
      const MessageOrigin = Moralis.Object.extend(ref);
      const messageOriginPush = new MessageOrigin();
      messageOriginPush.save({
        from: user.get("ethAddress"),
        to: router.query.userID,
        message: base64Text,
        publicKey: JSON.stringify(publicKeyEncrypt)
      });
    } else {
      const ref = `${user.get("ethAddress").slice(2)}${router.query.mesID.slice(2)}`
      const MessageOrigin = Moralis.Object.extend(ref);
      const messageOriginPush = new MessageOrigin();
      messageOriginPush.save({
        from: user.get("ethAddress"),
        to: router.query.userID,
        message: base64Text,
        publicKey: JSON.stringify(publicKeyEncrypt)
      });
      console.log(user.get("ethAddress"))
    }
  }

  const sendMessage = async () => {
    let messageList = []
    let main = {
      userAddress: user.get("ethAddress"),
      messages: messageList
    }

    const enc = new TextEncoder();
    const dec = new TextDecoder();

    const encodedMessage = enc.encode(message);
    const encryptedPrivateKEy = localStorage.getItem(`privateKeyUser${user.get("ethAddress")}`)
    const decrypt = (crypted, password) => JSON.parse(AES.decrypt(crypted, password).toString(ENC)).content
    const encrypt = (content, password) => AES.encrypt(JSON.stringify({ content }), password).toString()
    const decryptedPrivateKEy = decrypt(encryptedPrivateKEy, user.id);
    const publicKeyUser = JSON.parse(user.get("formatPublicKey"))

    const originPublicKey = await window.crypto.subtle.importKey(
      "jwk",
      publicKeyUser,
      {
        name: "RSA-OAEP",
        modulusLength: 4096,
        hash: "SHA-256"
      },
      true,
      ["encrypt"]
    );

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

    const encryptedText = await window.crypto.subtle.encrypt({
      name: "RSA-OAEP"
    },
      originPublicKey,
      encodedMessage
    )

    const decryptedText = await window.crypto.subtle.decrypt({
      name: "RSA-OAEP"
    },
      originPrivateKey,
      encryptedText
    )
    // console.log(dec.decode(decryptedText));

    if (JSON.parse(localStorage.getItem(router.query.mesID + user.get("ethAddress")) !== null)) {
      const encryptedMessages = localStorage.getItem(router.query.mesID + user.get("ethAddress"))
      const decryptedMessages = decrypt(encryptedMessages, user.id);
      main.messages = decryptedMessages.messages
      console.log(decryptedMessages.messages)
    }
    main.messages.push({ type: 1, message: message })
    const encryptedMessagesList = encrypt(main, user.id)
    localStorage.setItem(router.query.mesID + user.get("ethAddress"), encryptedMessagesList);
  }

  return (
    <div>
      <Head>
        <title>Messages-{router.query.mesID}</title>
      </Head>
      <Nav balance={false} />
      <div>
        <div></div>
        <div className={style.sendContainer}>
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a message" onKeyPress={e => {
            if (e.key === "Enter") {
              pushMessage();
            }
          }} />
          <button><FontAwesomeIcon icon={faPaperPlane} onClick={pushMessage} /></button>
          <button><FontAwesomeIcon icon={faPaperclip} onClick={sendImage} /></button>
        </div>
      </div>
    </div>
  );
}