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
import { faPaperPlane , faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/router';
import style from "../../styles/Messages.module.css"

export default function Messages() {
  const { isAuthenticated, user, setUserData } = useMoralis();
  const router = useRouter()
  const [message , setMessage] = useState("");

  if (!isAuthenticated) {
    return <Reject />;
  } else if (
    user.get("userNameChange") === undefined ||
    user.get("userNameChange") === false
  ) {
    return <ConfigAccount />;
  }
  if(user.get("reCheck") === 1) return <CheckPassword />

  if(user && router.query.mesID === user.get("ethAddress")) router.push("/")

  return (
    <div>
      <Head>
        <title>Messages</title>
      </Head>
      <Nav balance={false}/>
      <div>
        <div></div>
        <div className={style.sendContainer}>
          <input type="text" value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Write a message"/>
          <button><FontAwesomeIcon icon={faPaperPlane} /></button>
          <button><FontAwesomeIcon icon={faPaperclip} /></button>
        </div>
      </div>
    </div>
  );
}