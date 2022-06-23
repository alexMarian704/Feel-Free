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
            <div>
              <div onClick={()=> setPage("Messages") }>
                <h3>Messages</h3>
              </div>
              <div onClick={()=> setPage("FriendList") }>
                <h3>Friend List</h3>
              </div>
            </div>
            <h1>Hi {user.get("username")}</h1>
            {page === "FriendList" && <FriendList />}
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
