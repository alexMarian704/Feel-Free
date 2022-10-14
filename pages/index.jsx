import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import ConfigUser from "../components/ConfigUser";
import Info from "../components/Info";
import SignIn from "../components/Signin";
import Head from "next/head";
import Nav from "../components/Nav";
import Notifications from "../components/Notifications";
import { Moralis } from "moralis";
import FriendList from "../components/FriendList";
import style from "../styles/Home.module.css";
import PasswordConfig from "../components/Password";
import CheckPassword from "../components/CheckPassword";
import Chats from "../components/Chats";
import { userStatus } from "../function/userStatus";
import { useInternetConnection } from "../function/hooks/useInternetConnection";
import OfflineNotification from "../components/OfflineNotification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import UnsupportedChain from "../components/UnsupportedChain";
import LoadBackUp from "../components/BackUp/LoadBackUp";

export default function Home() {
  const { isAuthenticated, user, isWeb3EnableLoading, isWeb3Enabled, enableWeb3, chainId, isInitialized } = useMoralis();
  const [info, setInfo] = useState(null);
  const [page, setPage] = useState("Messages");
  const [importBackUp , setImportBackUp] = useState(false)
  const internetStatus = useInternetConnection()
  const route = useRouter()

  useEffect(() => {
    if (!isWeb3Enabled && !isWeb3EnableLoading) {
      enableWeb3()
    }
  }, [])

  if (isInitialized === false)
    return (
      <div>
        <div className={style.loadingContainer}>
          <div className={style.loader}></div>
        </div>
      </div>
    )

  if (!isAuthenticated) return <SignIn />;

  if (user.get("reCheck") === 1 && user.get("passwordConfig") !== false) return <CheckPassword />

  return (
    <div className="container">
      <Head>
        <title>Home</title>
      </Head>
      {user.get("userNameChange") === true && user.get("passwordConfig") === true && (info === true || user.get("info") === true) && <Nav balance={false} />}
      <div className="marginDiv"></div>
      {user.get("userNameChange") === true && user.get("passwordConfig") === true &&
        (info === true || user.get("info") === true) && (
          <div>
            <div className={style.homeNav}>
              <div onClick={() => {
                setPage("Messages")
                userStatus()
              }
              } className={page === "Messages" ? `${style.page} ${style.select}` : style.page}>
                <h3>Messages</h3>
              </div>
              <div onClick={() => {
                setPage("FriendList")
                userStatus()
              }} className={page === "FriendList" ? `${style.page} ${style.select}` : style.page}>
                <h3>Friend List</h3>
              </div>
            </div>
            {page === "FriendList" && <FriendList />}
            {page === "Messages" && <Chats importBackUp={importBackUp} />}
            <Notifications />
            <button className={style.createGroup} onClick={() => route.push("/create/group")}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <div className={style.bottomMargin} ></div>
          </div>
        )}
      {(user.get("userNameChange") === undefined ||
        user.get("userNameChange") === false) && (
          <ConfigUser setInfo={setInfo} />
        )}
      {(user.get("passwordConfig") === undefined ||
        user.get("passwordConfig") === false) && user.get("userNameChange") === true && user.get("info") === true && (
          <PasswordConfig />
        )}
      {(user.get("info") === false ||
        info === false) && <Info setInfo={setInfo} />}
      {user.get("userNameChange") === true && user.get("passwordConfig") === true && (info === true || user.get("info") === true) && localStorage.getItem(`privateKeyUser${user.get("ethAddress")}`) !== null && <LoadBackUp setImportBackUp={setImportBackUp} />}
      {internetStatus === false && <OfflineNotification />}
      {(chainId !== null && chainId !== "0x4" && chainId !== "0x61" && chainId !== "0x13881") && <UnsupportedChain />}
    </div>
  );
}
