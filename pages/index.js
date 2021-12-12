import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import ConfigUser from "../components/ConfigUer";
import Info from "../components/Info";
import SignIn from "../components/Signin";
import Head from "next/head";
import Nav from "../components/Nav";

export default function Home({ name }) {
  const { isAuthenticated, user } = useMoralis();
  const [info, setInfo] = useState(null);
  
  if (!isAuthenticated) return <SignIn />;

  return (
    <div className="container">
      <Head>
        <title>Home</title>
      </Head>
      <Nav />
      <div className="marginDiv"></div>
      {user.get("userNameChange") === true &&
        (info === true || user.get("info") === true) && (
          <div>
            <h1>Hi {user.get("username")}</h1>
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
