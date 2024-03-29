import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useMoralis } from "react-moralis";
import Reject from "../../components/Reject";
import ConfigAccount from "../../components/ConfigAccount";
import { Moralis } from "moralis";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProfilePicture from "../../public/profile.jpg";
import { faPaperPlane, faPaperclip, faArrowLeft, faTimes, faChevronDown, faImage } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/router';
import style from "../../styles/Messages.module.css"
import AES from 'crypto-js/aes';
import ENC from 'crypto-js/enc-utf8'
import Link from "next/link";
import RenderMessage from "../../components/Message";
import { getFriendUnreadMessages } from "../../function/getFriendUnreadMessages";
import Options from "../../components/Options";
import { messageOrder } from "../../function/messageOrder";
import Media from "../../components/Media";
import ConfirmDelete from "../../components/ConfirmDelete";
import { useOnlineFriend } from "../../function/hooks/useOnlineFriend.js"
import { userStatus } from "../../function/userStatus";
import { useInternetConnection } from "../../function/hooks/useInternetConnection";
import OfflineNotification from "../../components/OfflineNotification";
import CheckPassword from "../../components/CheckPassword";

export default function Messages() {
  const { isAuthenticated, user, setUserData, isInitialized } = useMoralis();
  const router = useRouter()
  const [message, setMessage] = useState("");
  const [friendData, setFriendData] = useState("");
  const [error, setError] = useState("");
  const [localMessages, setLocalMessages] = useState([]);
  const messageRef = useRef();
  const [friednUnreadMessages, setFriendUnreadMessages] = useState(0)
  const [render, setRender] = useState(100);
  const fileRef = useRef();
  const [open, setOpen] = useState(false)
  const [focusImage, setFocusImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState([])
  const [block, setBlock] = useState(false);
  const [myBlock, setMyBlock] = useState(false)
  const [openMedia, setOpenMedia] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [reply, setReply] = useState("");
  const [openReply, setOpenReply] = useState(-1);
  const [scrollIntoViewIndicator, setScrollIntoViewIndicator] = useState("");
  const onlineStatus = useOnlineFriend(router.query.mesID);
  const internetStatus = useInternetConnection()
  const [positionScroll, setPositionScroll] = useState(1);
  const [errorFile, setErrorFile] = useState("")
  const [loadingImages, setLoadingImages] = useState(true);
  const [numberOfImages, setNumberOfImages] = useState(-1);
  const [lastSeen , setLastSeen] = useState(true)
  const [loadingLastSeen , setLoadingLastSeen] = useState(true)

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
        let data = {
          name: results.attributes.name,
          name2: results.attributes.name2,
          profilePhoto: results.attributes.profilePhoto
        }
        localStorage.setItem(user.get("ethAddress") + router.query.mesID + "data", JSON.stringify(data))
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

        let nr = 0;
        for (let i = decryptedMessages.messages.length > 100 ? decryptedMessages.messages.length - 100 : 0; i < decryptedMessages.messages.length; i++) {
          let file = decryptedMessages.messages[i].file;
          if (file === "image/jpg" || file === "image/png" || file === "image/jpeg") {
            nr++;
          }
        }

        setNumberOfImages(nr);
        setLocalMessages(decryptedMessages.messages)
        setInitial(decryptedMessages.messages)
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
      query.notEqualTo("delete", "Delete")
      const results = await query.find();
      deleteNotification();
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

          const bufferReply = _base64ToArrayBuffer(results[i].attributes.reply)
          const decryptedReply = await window.crypto.subtle.decrypt({
            name: "RSA-OAEP"
          },
            originPrivateKey,
            bufferReply
          )
          const textReply = dec.decode(decryptedReply)

          if (JSON.parse(localStorage.getItem(router.query.mesID + user.get("ethAddress")) !== null)) {
            const encryptedMessages = localStorage.getItem(router.query.mesID + user.get("ethAddress"))
            const decryptedMessages = decrypt(encryptedMessages, user.id);
            main.messages = decryptedMessages.messages
            //console.log(decryptedMessages.messages)
          }
          main.messages.push({ type: 2, message: textMessage, time: results[i].attributes.time, file: results[i].attributes.file, fileName: results[i].attributes.fileName, tag: results[i].attributes.tag, reply: JSON.parse(textReply) })
          const encryptedMessagesList = encrypt(main, user.id)
          localStorage.setItem(router.query.mesID + user.get("ethAddress"), encryptedMessagesList);
        }
        for (let i = 0; i < results.length; i++) {
          const query1 = new Moralis.Query(unread);
          query1.equalTo("time", results[i].attributes.time);
          query1.notEqualTo("delete", "Delete")
          const results1 = await query1.first();
          console.log(results1)
          if (results1 !== undefined)
            results1.destroy()
        }
        if (main.messages.length > 0) {
          setLocalMessages(main.messages)
          if(messageRef.current !== undefined)
            messageRef.current.scrollIntoView({ behavior: 'instant' })
          let data = JSON.parse(localStorage.getItem(user.get("ethAddress") + router.query.mesID + "data"))
          messageOrder(user.get("ethAddress"), router.query.mesID, main.messages[main.messages.length - 1].message, data.name, data.name2, main.messages[main.messages.length - 1].time, "friend", main.messages[main.messages.length - 1].file, main.messages[main.messages.length - 1].tag);
        }
      }
      main.messages = []
      const deleteRequest = Moralis.Object.extend(ref);
      const queryDelete = new Moralis.Query(deleteRequest);
      queryDelete.equalTo("from", router.query.mesID);
      queryDelete.equalTo("delete", "Delete")
      const _results = await queryDelete.find();
      console.log(_results)
      if (_results !== undefined) {
        for (let i = 0; i < _results.length; i++) {
          if (JSON.parse(localStorage.getItem(router.query.mesID + user.get("ethAddress")) !== null)) {
            const encryptedMessages = localStorage.getItem(router.query.mesID + user.get("ethAddress"))
            const decryptedMessages = decrypt(encryptedMessages, user.id);
            main.messages = decryptedMessages.messages
          }
          let poz = 0;
          main.messages.map((x, j) => {
            if (x.time === _results[i].attributes.time) {
              x.message = "This message was deleted"
              x.file = ""
              x.fileName = ""
              x.delete = true
              poz = j;
            }
          })
          const encryptedMessagesList = encrypt(main, user.id)
          localStorage.setItem(router.query.mesID + user.get("ethAddress"), encryptedMessagesList);
        }
        for (let i = 0; i < _results.length; i++) {
          const query1 = new Moralis.Query(unread);
          query1.equalTo("time", _results[i].attributes.time);
          query1.equalTo("delete", "Delete")
          const results1 = await query1.first();
          console.log(results1)
          if (results1 !== undefined)
            results1.destroy()
        }
        if (main.messages.length > 0) {
          setLocalMessages(main.messages)
          let data = JSON.parse(localStorage.getItem(user.get("ethAddress") + router.query.mesID + "data"))
          messageOrder(user.get("ethAddress"), router.query.mesID, "Deleted message", data.name, data.name2, main.messages[main.messages.length - 1].time, "friend", "message", main.messages[main.messages.length - 1].tag);
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
        if (mesObject.attributes.message !== "Delete") {
          const bufferText = _base64ToArrayBuffer(mesObject.attributes.message)
          const decryptedText = await window.crypto.subtle.decrypt({
            name: "RSA-OAEP"
          },
            originPrivateKey,
            bufferText
          )
          const textMessage = dec.decode(decryptedText)

          const bufferReply = _base64ToArrayBuffer(mesObject.attributes.reply)
          const decryptedReply = await window.crypto.subtle.decrypt({
            name: "RSA-OAEP"
          },
            originPrivateKey,
            bufferReply
          )
          const textReply = dec.decode(decryptedReply)

          const deleteMessage = Moralis.Object.extend(ref);
          const query1 = new Moralis.Query(deleteMessage);
          query1.equalTo("time", mesObject.attributes.time);
          const results1 = await query1.first();
          deleteNotification()
          if (textMessage !== "" && results1 !== undefined) {
            results1.destroy().then(() => {
              if (JSON.parse(localStorage.getItem(router.query.mesID + user.get("ethAddress")) !== null)) {
                const encryptedMessages = localStorage.getItem(router.query.mesID + user.get("ethAddress"))
                const decryptedMessages = decrypt(encryptedMessages, user.id);
                main.messages = decryptedMessages.messages
                //console.log(decryptedMessages.messages)
              }
              main.messages.push({ type: 2, message: textMessage, time: mesObject.attributes.time, file: mesObject.attributes.file, fileName: mesObject.attributes.fileName, tag: mesObject.attributes.tag, reply: JSON.parse(textReply) })

              const encryptedMessagesList = encrypt(main, user.id)
              localStorage.setItem(router.query.mesID + user.get("ethAddress"), encryptedMessagesList);
              let data = JSON.parse(localStorage.getItem(user.get("ethAddress") + router.query.mesID + "data"))

              messageOrder(user.get("ethAddress"), router.query.mesID, textMessage, data.name, data.name2, mesObject.attributes.time, "friend", mesObject.attributes.file, mesObject.attributes.tag)

              if (main.messages.length > 0) {
                setLocalMessages(main.messages)
                setRender(++render);
                const elementId = document.getElementById("scrollID");
                const scroll = elementId.scrollTop / (elementId.scrollHeight - elementId.clientHeight);
                if (Number(scroll.toPrecision(2)) >= 0.92) {
                  messageRef.current.scrollIntoView({ behavior: 'smooth' })
                }
              }
            })
          }
        } else if (mesObject.attributes.message === "Delete") {
          const deleteMessage = Moralis.Object.extend(ref);
          const query1 = new Moralis.Query(deleteMessage);
          query1.equalTo("time", mesObject.attributes.time);
          const results1 = await query1.first();

          if (results1 !== undefined) {
            results1.destroy().then(() => {
              const encryptedMessages = localStorage.getItem(router.query.mesID + user.get("ethAddress"))
              const decryptedMessages = decrypt(encryptedMessages, user.id);
              main.messages = decryptedMessages.messages
              let poz = 0
              main.messages.map((x, i) => {
                if (x.time === mesObject.attributes.time) {
                  x.message = "This message was deleted"
                  x.file = ""
                  x.fileName = ""
                  x.delete = true
                  poz = i;
                }
              })
              if (poz === main.messages.length - 1) {
                let data = JSON.parse(localStorage.getItem(user.get("ethAddress") + router.query.mesID + "data"))
                messageOrder(user.get("ethAddress"), router.query.mesID, "Deleted message", data.name, data.name2, mesObject.attributes.time, "friend", "message", mesObject.attributes.tag)
              }

              setLocalMessages(main.messages)
              const encryptedMessagesList = encrypt(main, user.id)
              localStorage.setItem(router.query.mesID + user.get("ethAddress"), encryptedMessagesList);
            })
          }
        }
      }
      )
    }
  }

  const deleteNotification = async () => {
    const userNotification = Moralis.Object.extend("Notification");
    const query = new Moralis.Query(userNotification);
    query.equalTo("from", router.query.mesID);
    query.equalTo("type", "New message");
    const results = await query.first();
    if (results !== undefined) {
      results.destroy()
    }
  }

  const getBlock = async (address, type) => {
    if (address && router.query.mesID) {
      const userAddress = user.get("ethAddress");
      const friendBlock = Moralis.Object.extend("Tags");
      const query = new Moralis.Query(friendBlock);
      query.equalTo("ethAddress", address);
      const results = await query.first();
      if (results) {
        if (type === "friend") {
          if (results.attributes.blockUsers !== undefined) {
            if (results.attributes.blockUsers.includes(userAddress))
              setBlock(true);
            else
              setBlock(false);
          }
        } else {
          if (results.attributes.blockUsers !== undefined) {
            if (results.attributes.blockUsers.includes(router.query.mesID))
              setMyBlock(true);
            else
              setMyBlock(false);
          }
        }
      }
    }
  }

  const after = (count, f) => {
    let noOfCalls = 0;
    return function (...rest) {
      noOfCalls = noOfCalls + 1;
      if (count === noOfCalls) {
        f(...rest)
      }
    }
  }

  useEffect(() => {
    if (isAuthenticated && messageRef.current !== undefined) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [reply])

  useEffect(() => {
    if (messageRef.current !== undefined) {
      messageRef.current.scrollIntoView({ behavior: 'instant' })
      setLoading(false);
    }
    else if (isAuthenticated) {
      if (localStorage.getItem(router.query.mesID + user.get("ethAddress")) === null)
        setLoading(false);
    }
  }, [initial, router.query.mesID, isAuthenticated])

  useEffect(async ()=>{
    if(isAuthenticated && router.query.mesID){
      const addressToTag = Moralis.Object.extend("Tags");
      const query = new Moralis.Query(addressToTag);
      query.equalTo("ethAddress", router.query.mesID);
      const results = await query.first();

      if(user.get("lastSeen") === false || results.attributes.lastSeen === false){
        setLastSeen(false);
      }
      setLoadingLastSeen(false)
    }
  },[isAuthenticated, router.query.mesID])

  useEffect(() => {
    if (isAuthenticated && localStorage.getItem(router.query.mesID + user.get("ethAddress")) !== null)
      setLoading(true)
    unredMessages()
    receiveMessage();
    getData()
    getLocalMessages()
    if (isAuthenticated) {
      getBlock(router.query.mesID, "friend")
      getBlock(user.get("ethAddress"), "my")
    }
    if (isAuthenticated) {
      getFriendUnreadMessages(router.query.mesID, user.get("ethAddress"), setFriendUnreadMessages)
    }
    if (isAuthenticated && router.query.mesID) {
      setTimeout(() => {
        setLoadingImages(false)
      }, 1000)
    }
  }, [isAuthenticated, router.query.mesID])

  if (isInitialized === false)
    return (
      <div>
        <div className={style.loadingContainer}>
          <div className={style.loader}></div>
        </div>
      </div>
    )
  else if (!isAuthenticated) {
    return <Reject />;
  } else if (
    user.get("userNameChange") === undefined ||
    user.get("userNameChange") === false
  ) {
    return <ConfigAccount />;
  }
  if (error === "User was not found") return (
    <div>
      <h1 style={{
        "width": "100%",
        "textAlign": "center",
        "paddingTop": "40px"
      }}>User was not found</h1>
      <div style={{
        "width": "100%",
        "display": "flex",
        "justifyContent": "center",
        "marginTop": "20px"
      }}>
        <button style={{
          "background": "#800040",
          "color": "white",
          "cursor": "pointer",
          "border": "none",
          "outline": "none",
          "fontSize": "calc(19px + 0.1vw)",
          "padding": "4px 10px 4px 10px",
          "borderRadius": "6px"
        }} onClick={() => router.push("/")}>Home page</button>
      </div>
    </div>
  )
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

  const notification = async (friendId, time) => {
    const userNotification = Moralis.Object.extend("Notification");
    const query = new Moralis.Query(userNotification);
    query.equalTo("to", router.query.mesID);
    query.equalTo("tag", user.get("userTag"));
    query.equalTo("type", "New message");
    const results = await query.first();
    // console.log(results);
    if (results === undefined) {
      const Notification = Moralis.Object.extend("Notification");
      const noti = new Notification();
      noti.save({
        from: user.get("ethAddress"),
        to: router.query.mesID,
        type: "New message",
        tag: user.get("userTag"),
        time: time
      });

      const notificationsACL = new Moralis.ACL();
      notificationsACL.setWriteAccess(user.id, true);
      notificationsACL.setReadAccess(user.id, true)
      notificationsACL.setWriteAccess(friendId, true);
      notificationsACL.setReadAccess(friendId, true);
      noti.setACL(notificationsACL)
      noti.save();
    }
  }

  const pushNotification = async (friendId, time) => {
    const userNotification = Moralis.Object.extend("Tags");
    const query = new Moralis.Query(userNotification);
    query.equalTo("ethAddress", router.query.mesID);
    const results = await query.first();
    if (results.attributes.muteNotification === undefined) {
      notification(friendId, time)
    } else if (results.attributes.muteNotification.includes(user.get("ethAddress")) === false) {
      notification(friendId, time)
    }
  }

  const pushMessage = async (file, fileName, message) => {
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
      const encodeReply = enc.encode(JSON.stringify(reply));
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
      const encryptedReply = await window.crypto.subtle.encrypt({
        name: "RSA-OAEP"
      },
        originPublicKey,
        encodeReply
      )

      const base64Reply = _arrayBufferToBase64(encryptedReply)
      const base64Text = _arrayBufferToBase64(encryptedText)

      if (JSON.parse(localStorage.getItem(router.query.mesID + user.get("ethAddress")) !== null)) {
        const encryptedMessages = localStorage.getItem(router.query.mesID + user.get("ethAddress"))
        const decryptedMessages = decrypt(encryptedMessages, user.id);
        main.messages = decryptedMessages.messages
      }
      main.messages.push({ type: 1, message: message, time: time, seen: false, file: file, fileName: fileName, reply: reply })
      console.log(main.messages)
      const encryptedMessagesList = encrypt(main, user.id)
      localStorage.setItem(router.query.mesID + user.get("ethAddress"), encryptedMessagesList);
      messageOrder(user.get("ethAddress"), router.query.mesID, message, friendData.name, friendData.name2, time, "you", file, friendData.userTag)

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
        file: file,
        fileName: fileName,
        tag: user.get("userTag"),
        reply: base64Reply
      });
      const messageACL = new Moralis.ACL();
      messageACL.setWriteAccess(user.id, true);
      messageACL.setReadAccess(user.id, true)
      messageACL.setWriteAccess(results.attributes.idUser, true);
      messageACL.setReadAccess(results.attributes.idUser, true);
      messageOriginPush.setACL(messageACL)
      messageOriginPush.save();

      pushNotification(results.attributes.idUser, time);

      if (main.messages.length > 0) {
        setLocalMessages(main.messages)
        setMessage("");
        setFriendUnreadMessages(++friednUnreadMessages)
        setRender(++render);
        if(messageRef.current !== undefined)
          messageRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const deleteRequest = async (time) => {
    let messageList = []
    let main = {
      userAddress: user.get("ethAddress"),
      messages: messageList
    }

    const addressToTag = Moralis.Object.extend("Tags");
    const query = new Moralis.Query(addressToTag);
    query.equalTo("ethAddress", router.query.mesID);
    const results = await query.first();

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
      message: "Delete",
      time: time,
      tag: user.get("userTag"),
      delete: "Delete"
    });
    const messageACL = new Moralis.ACL();
    messageACL.setWriteAccess(user.id, true);
    messageACL.setReadAccess(user.id, true)
    messageACL.setWriteAccess(results.attributes.idUser, true);
    messageACL.setReadAccess(results.attributes.idUser, true);
    messageOriginPush.setACL(messageACL)
    messageOriginPush.save();

    const encryptedMessages = localStorage.getItem(router.query.mesID + user.get("ethAddress"))
    const decryptedMessages = decrypt(encryptedMessages, user.id);
    main.messages = decryptedMessages.messages
    let poz
    main.messages.map((x, i) => {
      if (x.time === time) {
        x.message = "This message was deleted"
        x.file = ""
        x.fileName = ""
        x.delete = true
        poz = i
      }
    })
    if (poz === main.messages.length - 1) {
      messageOrder(user.get("ethAddress"), router.query.mesID, "Deleted message", friendData.name, friendData.name2, time, "you", "message", friendData.userTag)
    }

    setLocalMessages(main.messages)
    const encryptedMessagesList = encrypt(main, user.id)
    localStorage.setItem(router.query.mesID + user.get("ethAddress"), encryptedMessagesList);
  }

  const deleteForYou = (time) => {
    let messageList = []
    let main = {
      userAddress: user.get("ethAddress"),
      messages: messageList
    }
    const encryptedMessages = localStorage.getItem(router.query.mesID + user.get("ethAddress"))
    const decryptedMessages = decrypt(encryptedMessages, user.id);
    main.messages = decryptedMessages.messages
    let poz
    main.messages.map((x, i) => {
      if (x.time === time) {
        x.message = "This message was deleted"
        x.file = ""
        x.fileName = ""
        x.delete = true
        poz = i
      }
    })
    if (poz === main.messages.length - 1) {
      let data = JSON.parse(localStorage.getItem(user.get("ethAddress") + router.query.mesID + "data"))
      messageOrder(user.get("ethAddress"), router.query.mesID, "Deleted message", friendData.name, friendData.name2, time, "friend", "message", friendData.userTag)
    }

    setLocalMessages(main.messages)
    const encryptedMessagesList = encrypt(main, user.id)
    localStorage.setItem(router.query.mesID + user.get("ethAddress"), encryptedMessagesList);
  }

  const sendImage = async (e) => {
    const file = e.target.files[0];
    console.log(file)
    if (file.type === "image/jpg" || file.type === "image/png" || file.type === "image/jpeg" || file.type === "text/plain" || file.type === "application/pdf") {
      const imageMessage = new Moralis.File(file.name, file);
      await imageMessage.saveIPFS()
        .catch((err) => {
          console.log(err)
        })

      pushMessage(file.type, file.name, imageMessage.ipfs());
      setReply("")
      setErrorFile("")
    } else {
      setErrorFile("Unsupported file type")
      setTimeout(() => {
        setErrorFile("")
      }, 3000)
    }

  }

  const d = new Date();
  const _d = new Date(onlineStatus.time);
  let time = d.getTime();
  let day = _d.getDate();
  let month = _d.getMonth()
  let year = _d.getFullYear()
  let minutes = _d.getMinutes();
  let hours = _d.getHours();
  const lastConnected = minutes <= 9 ? `last seen: ${day}.${month + 1}.${year}, ${hours}:0${minutes}` : `last seen: ${day}.${month + 1}.${year}, ${hours}:${minutes}`;

  const handleScroll = (e) => {
    const element = e.currentTarget;
    const position = element.scrollTop / (element.scrollHeight - element.clientHeight);
    if (Math.abs(positionScroll - position) >= 0.02)
      setPositionScroll(Number(position.toPrecision(2)))
  };

  const onComplete = after(numberOfImages, () => {
    setLoadingImages(false)
    if (messageRef.current !== undefined) {
      messageRef.current.scrollIntoView({ behavior: 'instant' })
    }
  })

  return (
    <div className={style.body}>
      <Head>
        <title>Messages-{router.query.mesID}</title>
      </Head>
      <div className={style.focusImage} style={focusImage !== "" ? { width: "100%", height: "100vh" } : { width: "0vw", height: "0vh" }}>
        <img src={focusImage}
          alt="Image"
          className={style.imgFocus} style={focusImage !== "" ? { display: "block" } : { display: "none" }} />
        <button onClick={() => setFocusImage("")} style={focusImage !== "" ? { display: "block" } : { display: "none" }}>
          <FontAwesomeIcon icon={faTimes} /></button>
      </div>
      <div className={style.mesNav} onClick={userStatus}>
        <div className={style.containers}>
          <button onClick={() => router.push("/")} className={style.backBut}><FontAwesomeIcon icon={faArrowLeft} /></button>
          {friendData !== "" && <div className={style.alignImg} onClick={() => router.push(`/users/${router.query.mesID}`)}>
            {friendData.profilePhoto !== undefined && <Image src={friendData.profilePhoto} alt="Profile Photo"
              layout="fill"
              objectFit="cover" />}
            {friendData.profilePhoto == undefined && <Image src={ProfilePicture} alt="Profile Photo" />}
          </div>}
          <div className={style.infoContainer}>
            {friendData !== "" && <Link href={`/users/${router.query.mesID}`}>
              <h2>{friendData.username}</h2>
            </Link>}
            {loadingLastSeen === false && lastSeen === true && onlineStatus.time !== undefined && onlineStatus.time !== "" && (time - onlineStatus.time) / 1000 / 60 <= 1 && <p>connected</p>}
            {loadingLastSeen === false && lastSeen === true && onlineStatus.time !== undefined && onlineStatus.time !== "" && (time - onlineStatus.time) / 1000 / 60 > 1 && <p>{lastConnected}</p>}
          </div>
        </div>
        <Options open={open} setOpen={setOpen} userAddress={user.get("ethAddress")} friendAddress={router.query.mesID} getBlock={getBlock} setOpenMedia={setOpenMedia} setOpenConfirm={setOpenConfirm} friendTag={friendData.userTag} />
      </div>
      {(loading === true || loadingImages === true) && <div className={style.loadingContainer}>
        <div className={style.loader}></div>
      </div>}

      {openMedia === true && <Media setOpenMedia={setOpenMedia} messages={localMessages} friendData={friendData} setFocusImage={setFocusImage} />}

      {openConfirm === true && <ConfirmDelete userAddress={user.get("ethAddress")} friendAddress={router.query.mesID} setOpenConfirm={setOpenConfirm} />}

      <div className={style.messageContainer} onClick={() => setOpen(false)} style={reply === "" ? { height: "calc(97.2vh - 125px)" } : { height: "calc(95.4vh - 162px)" }} onScroll={handleScroll} id="scrollID">
        {render < localMessages.length - 1 && <div className={style.renderMoreDiv}>
          <button className={style.renderMore} onClick={() => setRender(render + 100)}>Load messages</button>
        </div>}
        {numberOfImages !== -1 && localMessages.length > 0 && localMessages.map((message, i) => {
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
                    <p className={style.chatDate}>{day}.{month + 1}.{year}</p>
                  </div>}
                <RenderMessage message={message} refMes={messageRef} number={i} total={localMessages.length} unread={friednUnreadMessages} focusImage={focusImage} setFocusImage={setFocusImage} setReply={setReply} openReply={openReply} setOpenReply={setOpenReply} scrollIntoViewIndicator={scrollIntoViewIndicator} setScrollIntoViewIndicator={setScrollIntoViewIndicator} deleteRequest={deleteRequest} deleteForYou={deleteForYou} onComplete={onComplete} />
              </div>
            )
        })}
        {localMessages.length > 0 && positionScroll < 0.92 &&
          <button className={style.scrollToBottom} style={reply === "" ? { bottom: "calc(65px + 1.8vh)" } : { bottom: "calc(105px + 3.6vh)" }} onClick={() => messageRef.current.scrollIntoView({ behavior: 'smooth' })}>
            <FontAwesomeIcon icon={faChevronDown} />
          </button>}
      </div>
      <div>
        {block === false && myBlock === false && reply && reply.image !== true && <div className={style.replyContainer}>
          <p>{reply.message}</p>
          <button onClick={() => setReply("")}>x</button>
        </div>}
        {block === false && myBlock === false && reply && reply.image === true && <div className={style.replyContainer}>
          <div className={style.imgMainReply}>
            <div>
              You: <FontAwesomeIcon icon={faImage} />
            </div>
            <div className={style.replyImage}>
              <Image
                width="100%"
                height="100%"
                layout="fill"
                objectFit="cover"
                src={reply.message}
                alt="Profile Photo" />
            </div>
          </div>
          <button onClick={() => setReply("")}>x</button>
        </div>}
        {block === false && myBlock === false && <div className={style.sendContainer} onClick={() => setOpen(false)}>
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a message" onKeyPress={e => {
            if (e.key === "Enter") {
              pushMessage("message", "message", message);
              setReply("");
            }
          }} onClick={userStatus} />
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
            onClick={userStatus}
          />
        </div>}
        {block === true &&
          <div className={style.sendContainer} onClick={() => setOpen(false)}>
            <h4>You have been blocked</h4>
          </div>}
        {myBlock === true && friendData !== "" &&
          <div className={style.sendContainer} onClick={() => setOpen(false)}>
            <h4>You have blocked {friendData.name} {friendData.name2}</h4>
          </div>}
      </div>
      {errorFile !== "" && <p className={style.errorFile}>{errorFile}</p>}
      {internetStatus === false && <OfflineNotification />}
    </div>
  );
}