import React, { useState, useEffect, useRef } from "react";
import Nav from '../../components/Nav';
import Head from "next/head";
import { useMoralis } from "react-moralis";
import Reject from "../../components/Reject";
import ConfigAccount from "../../components/ConfigAccount";
import { Moralis } from "moralis";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProfilePicture from "../../public/profile.jpg";
import { faPaperPlane, faPaperclip, faArrowLeft, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/router';
import style from "../../styles/Messages.module.css"
import AES from 'crypto-js/aes';
import ENC from 'crypto-js/enc-utf8'
import Link from "next/link";
import RenderMessage from "../../components/Message";
import { getFriendUnreadMessages } from "../../function/getFriendUnreadMessages";
import Options from "../../components/Options";
import { messageOrder } from "../../function/messageOrder";

export default function Messages() {
  const { isAuthenticated, user, setUserData } = useMoralis();
  const router = useRouter()
  const [message, setMessage] = useState("");
  const [friendData, setFriendData] = useState("");
  const [error, setError] = useState("");
  const [localMessages, setLocalMessages] = useState([]);
  const messageRef = useRef();
  const [friednUnreadMessages, setFriendUnreadMessages] = useState(0)
  const [idMessage, setIdMessage] = useState([]);
  const [render, setRender] = useState(100);
  const fileRef = useRef();
  const [open, setOpen] = useState(false)
  const [focusImage, setFocusImage] = useState("");

  function _base64ToArrayBuffer(base64) {
    let binary_string = window.atob(base64);
    let len = binary_string.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  const getData = async () => {
    if (isAuthenticated && router.query.mesID) {
      const addressToTag = Moralis.Object.extend("Tags");
      const query = new Moralis.Query(addressToTag);
      query.equalTo("ethAddress", router.query.mesID);
      const results = await query.first();
      if (results !== undefined) {
        setFriendData(results.attributes);
      } else {
        setError("User was not found");
      }
    }
  }

  const getLocalMessages = () => {
    if (isAuthenticated && router.query.mesID) {
      if (JSON.parse(localStorage.getItem(router.query.mesID + user.get("ethAddress")) !== null)) {
        const encryptedMessages = localStorage.getItem(router.query.mesID + user.get("ethAddress"))
        const decryptedMessages = decrypt(encryptedMessages, user.id);
        // console.log(decryptedMessages.messages)
        setLocalMessages(decryptedMessages.messages)
      }
    }
  }

  const decrypt = (crypted, password) => JSON.parse(AES.decrypt(crypted, password).toString(ENC)).content
  const encrypt = (content, password) => AES.encrypt(JSON.stringify({ content }), password).toString()

  const unredMessages = async () => {
    if (isAuthenticated && router.query.mesID) {
      let messageList = []
      let main = {
        userAddress: user.get("ethAddress"),
        messages: messageList
      }
      let ref;
      if (router.query.mesID.localeCompare(user.get("ethAddress")) === 1) {
        ref = `a${router.query.mesID.slice(2)}${user.get("ethAddress").slice(2)}`
      } else {
        ref = `a${user.get("ethAddress").slice(2)}${router.query.mesID.slice(2)}`
      }
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

      const unread = Moralis.Object.extend(ref);
      const query = new Moralis.Query(unread);
      query.equalTo("from", router.query.mesID);
      const results = await query.find();
      if (results !== undefined) {
        for (let i = 0; i < results.length; i++) {
          const bufferText = _base64ToArrayBuffer(results[i].attributes.message)
          const decryptedText = await window.crypto.subtle.decrypt({
            name: "RSA-OAEP"
          },
            originPrivateKey,
            bufferText
          )
          const textMessage = dec.decode(decryptedText)
          if (JSON.parse(localStorage.getItem(router.query.mesID + user.get("ethAddress")) !== null)) {
            const encryptedMessages = localStorage.getItem(router.query.mesID + user.get("ethAddress"))
            const decryptedMessages = decrypt(encryptedMessages, user.id);
            main.messages = decryptedMessages.messages
            //console.log(decryptedMessages.messages)
          }
          main.messages.push({ type: 2, message: textMessage, time: results[i].attributes.time, image: results[i].attributes.image })
          const encryptedMessagesList = encrypt(main, user.id)
          localStorage.setItem(router.query.mesID + user.get("ethAddress"), encryptedMessagesList);
        }
        for (let i = 0; i < results.length; i++) {
          const query1 = new Moralis.Query(unread);
          query1.equalTo("time", results[i].attributes.time);
          const results1 = await query1.first();
          if (results1 !== undefined)
            results1.destroy()
        }
        if (main.messages.length > 0) {
          setLocalMessages(main.messages)
          messageRef.current.scrollIntoView({ behavior: 'instant' })
          messageOrder(user.get("ethAddress") , router.query.mesID)
        }
      }
    }
  }

  const receiveMessage = async () => {
    if (isAuthenticated && router.query.mesID) {
      let messageList = []
      let main = {
        userAddress: user.get("ethAddress"),
        messages: messageList
      }
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

      let ref
      if (router.query.mesID.localeCompare(user.get("ethAddress")) === 1) {
        ref = `a${router.query.mesID.slice(2)}${user.get("ethAddress").slice(2)}`
      } else {
        ref = `a${user.get("ethAddress").slice(2)}${router.query.mesID.slice(2)}`
      }
      const query = new Moralis.Query(ref)
      query.equalTo("from", router.query.mesID);
      const subscription = await query.subscribe()
      subscription.on("create", async (mesObject) => {
        const bufferText = _base64ToArrayBuffer(mesObject.attributes.message)
        const decryptedText = await window.crypto.subtle.decrypt({
          name: "RSA-OAEP"
        },
          originPrivateKey,
          bufferText
        )
        const textMessage = dec.decode(decryptedText)

        const deleteMessage = Moralis.Object.extend(ref);
        const query1 = new Moralis.Query(deleteMessage);
        query1.equalTo("time", mesObject.attributes.time);
        const results1 = await query1.first();
        if (textMessage !== "" && results1 !== undefined) {
          results1.destroy().then(() => {
            if (JSON.parse(localStorage.getItem(router.query.mesID + user.get("ethAddress")) !== null)) {
              const encryptedMessages = localStorage.getItem(router.query.mesID + user.get("ethAddress"))
              const decryptedMessages = decrypt(encryptedMessages, user.id);
              main.messages = decryptedMessages.messages
              //console.log(decryptedMessages.messages)
            }
            main.messages.push({ type: 2, message: textMessage, time: mesObject.attributes.time, image: mesObject.attributes.image })
            const encryptedMessagesList = encrypt(main, user.id)
            localStorage.setItem(router.query.mesID + user.get("ethAddress"), encryptedMessagesList);
            messageOrder(user.get("ethAddress") , router.query.mesID)
            if (main.messages.length > 0) {
              setLocalMessages(main.messages)
              setRender(++render);
              messageRef.current.scrollIntoView({ behavior: 'smooth' })
            }
          })
        }
      })
    }
  }

  useEffect(() => {
    if (messageRef.current !== undefined) {
      messageRef.current.scrollIntoView({ behavior: 'instant' })
    }
  }, [messageRef.current, router.query.mesID])

  useEffect(() => {
    unredMessages()
    receiveMessage();
    getData()
    getLocalMessages()
    if (isAuthenticated) {
      getFriendUnreadMessages(router.query.mesID, user.get("ethAddress"), setFriendUnreadMessages)
    }
  }, [isAuthenticated, router.query.mesID])

  // console.log(friednUnreadMessages);

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

  function _arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  const pushMessage = async (image, message) => {
    if (message !== "") {
      const d = new Date();
      let time = d.getTime();
      let messageList = []
      let main = {
        userAddress: user.get("ethAddress"),
        messages: messageList
      }
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

      if (JSON.parse(localStorage.getItem(router.query.mesID + user.get("ethAddress")) !== null)) {
        const encryptedMessages = localStorage.getItem(router.query.mesID + user.get("ethAddress"))
        const decryptedMessages = decrypt(encryptedMessages, user.id);
        main.messages = decryptedMessages.messages
        //console.log(decryptedMessages.messages)
      }
      main.messages.push({ type: 1, message: message, time: time, seen: false, image: image })
      console.log(main.messages)
      const encryptedMessagesList = encrypt(main, user.id)
      localStorage.setItem(router.query.mesID + user.get("ethAddress"), encryptedMessagesList);
      messageOrder(user.get("ethAddress") , router.query.mesID)

      let ref;
      if (router.query.mesID.localeCompare(user.get("ethAddress")) === 1) {
        ref = `a${router.query.mesID.slice(2)}${user.get("ethAddress").slice(2)}`
      } else {
        ref = `a${user.get("ethAddress").slice(2)}${router.query.mesID.slice(2)}`
      }
      const MessageOrigin = Moralis.Object.extend(ref);
      const messageOriginPush = new MessageOrigin();
      messageOriginPush.save({
        from: user.get("ethAddress"),
        to: router.query.userID,
        message: base64Text,
        publicKey: JSON.stringify(publicKeyEncrypt),
        time: time,
        image: image
      });
      const messageACL = new Moralis.ACL();
      messageACL.setWriteAccess(user.id, true);
      messageACL.setReadAccess(user.id, true)
      messageACL.setWriteAccess(results.attributes.idUser, true);
      messageACL.setReadAccess(results.attributes.idUser, true);
      messageOriginPush.setACL(messageACL)
      messageOriginPush.save();
      if (main.messages.length > 0) {
        setLocalMessages(main.messages)
        setMessage("");
        setFriendUnreadMessages(++friednUnreadMessages)
        setRender(++render);
        messageRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const sendImage = async (e) => {
    const file = e.target.files[0];
    console.log(e.target.files[0]);
    const type = e.target.files[0].type.replace("image/", "");
    const name = `imageMessage.${type}`;
    const imageMessage = new Moralis.File(name, file);
    await imageMessage.saveIPFS();

    pushMessage(true, imageMessage.ipfs());
  }

  return (
    <div className={style.body}>
      <Head>
        <title>Messages-{router.query.mesID}</title>
      </Head>
      <div className={style.focusImage} style={focusImage !== "" ? { width: "100vw" , height:"100vh" } : { width:"0vw" , height:"0vh" }}>
        <img src={focusImage}
          alt="Image"
          className={style.imgFocus} style={focusImage !== "" ? { display:"block" } : { display:"none" }}/>
          <button onClick={()=> setFocusImage("")} style={focusImage !== "" ? { display:"block" } : { display:"none" }}>
            <FontAwesomeIcon icon={faTimes}/></button>
      </div>
      <div className={style.mesNav}>
        <div className={style.containers}>
          <button onClick={() => router.push("/")} className={style.backBut}><FontAwesomeIcon icon={faArrowLeft} /></button>
          {friendData !== "" && <div className={style.alignImg} onClick={() => router.push(`/users/${router.query.mesID}`)}>
            {friendData.profilePhoto !== undefined && <img src={friendData.profilePhoto} alt="Profile Photo" />}
            {friendData.profilePhoto == undefined && <Image src={ProfilePicture} alt="Profile Photo" />}
          </div>}
          {friendData !== "" && <Link href={`/users/${router.query.mesID}`}>
            <h2>{friendData.name} {friendData.name2}</h2>
          </Link>}
        </div>
        <Options open={open} setOpen={setOpen} />
      </div>
      <div className={style.messageContainer} onClick={() => setOpen(false)}>
        {render < localMessages.length - 1 && <div className={style.renderMoreDiv}>
          <button className={style.renderMore} onClick={() => setRender(render + 100)}>Load messages</button>
        </div>}
        {localMessages.length > 0 && localMessages.map((message, i) => {
          if (i >= localMessages.length - render - 1)
            return (
              <RenderMessage message={message} key={i} refMes={messageRef} number={i} total={localMessages.length} unread={friednUnreadMessages} focusImage={focusImage} setFocusImage={setFocusImage} />
            )
        })}
      </div>
      <div>
        <div className={style.sendContainer} onClick={() => setOpen(false)}>
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a message" onKeyPress={e => {
            if (e.key === "Enter") {
              pushMessage(false, message);
            }
          }} />
          <button onClick={() => pushMessage(false, message)}><FontAwesomeIcon icon={faPaperPlane} /></button>
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
      </div>
    </div>
  );
}