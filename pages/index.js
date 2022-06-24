import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import ConfigUser from "../components/ConfigUer";
import Info from "../components/Info";
import SignIn from "../components/Signin";
import Head from "next/head";
import Nav from "../components/Nav";
import Notifications from "../components/Notifications";
import { Moralis } from "moralis";
import FriendList from "../components/FriendList";
import style from "../styles/Home.module.css";

export default function Home({ name }) {
  const { isAuthenticated, user, isWeb3EnableLoading, isWeb3Enabled, enableWeb3 } = useMoralis();
  const [info, setInfo] = useState(null);
  const [page , setPage] = useState("Messages");

  useEffect(() => {
    if (!isWeb3Enabled && !isWeb3EnableLoading) {
      enableWeb3()
    }
  }, [])

  if (!isAuthenticated) return <SignIn />;

  return (
    <div className="container">
      <Head>
        <title>Home</title>
      </Head>
      <Nav balance={false} />
      <div className="marginDiv"></div>
      {user.get("userNameChange") === true &&
        (info === true || user.get("info") === true) && (
          <div>
            <div className={style.homeNav}>
              <div onClick={()=> setPage("Messages") } className={page === "Messages" ? `${style.page} ${style.select}`: style.page}>
                <h3>Messages</h3>
              </div>
              <div onClick={()=> setPage("FriendList") } className={page === "FriendList" ? `${style.page} ${style.select}`: style.page}>
                <h3>Friend List</h3>
              </div>
            </div>
            {page === "FriendList" && <FriendList /> }
            <Notifications />
          </div>
        )}
      {(user.get("userNameChange") === undefined ||
        user.get("userNameChange") === false) && (
          <ConfigUser setInfo={setInfo} />
        )}
      {(user.get("info") === false ||
        info === false) && <Info setInfo={setInfo} />}

    </div>
  );
}
