import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import ConfigUser from "../components/ConfigUer";
import Info from "../components/Info";
import SignIn from "../components/Signin";
import Link from "next/link"
import Head from 'next/head'
import Nav from "../components/Nav";

export default function Home({ name }) {
  const { isAuthenticated , user , logout  } = useMoralis();
  const [info, setInfo] = useState(null);

  if(!isAuthenticated)
    return <SignIn />

  return (
    <div className="container">
      <Head>
        <title>Home</title>
      </Head>
      <Nav />
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
      {(user.get("info") === false || info === false || user.get("info") === undefined) && (
        <Info setInfo={setInfo} />
      )}
    </div>
  );
}
