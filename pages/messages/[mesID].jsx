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

  const sendMessage = async () => {
    let messageList = []

    const enc = new TextEncoder();
    const dec = new TextDecoder();

    const encodedMessage = enc.encode(message);
    const encryptedPrivateKEy = localStorage.getItem("privateKeyUser")
    const decrypt = (crypted, password) => JSON.parse(AES.decrypt(crypted, password).toString(ENC)).content
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
    console.log(dec.decode(decryptedText));

    // if (JSON.parse(localStorage.getItem(router.query.mesID) !== null)) {
    //   messageList = JSON.parse(localStorage.getItem(router.query.mesID))
    // }
    // messageList.push({ type: 1, message: message })
    // localStorage.setItem(router.query.mesID, JSON.stringify(messageList));
  }

  //console.log(JSON.parse(localStorage.getItem(router.query.mesID)))

  return (
    <div>
      <Head>
        <title>Messages</title>
      </Head>
      <Nav balance={false} />
      <div>
        <div></div>
        <div className={style.sendContainer}>
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a message" onKeyPress={e => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }} />
          <button><FontAwesomeIcon icon={faPaperPlane} onClick={sendMessage} /></button>
          <button><FontAwesomeIcon icon={faPaperclip} onClick={sendImage} /></button>
        </div>
      </div>
    </div>
  );
}