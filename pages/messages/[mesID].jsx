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

  const sendMessage = () => {
    let messageList = []

    if (JSON.parse(localStorage.getItem(router.query.mesID) !== null)) {
      messageList = JSON.parse(localStorage.getItem(router.query.mesID))
    }
    messageList.push({ type: 1, message: message })
    localStorage.setItem(router.query.mesID, JSON.stringify(messageList));
  }

  console.log(JSON.parse(localStorage.getItem(router.query.mesID)))

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
          <button><FontAwesomeIcon icon={faPaperclip} /></button>
        </div>
      </div>
    </div>
  );
}