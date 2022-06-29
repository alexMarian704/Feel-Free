import React, { useState, useEffect } from "react";
import Nav from "../components/Nav";
import Head from "next/head";
import { useMoralis } from "react-moralis";
import Reject from "../components/Reject";
import ConfigAccount from "../components/ConfigAccount";
import { Moralis } from "moralis";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getBalance } from "../function/balance";
import ProfilePicture from "../public/profile.jpg";

export default function profile() {
  const { isAuthenticated, user, setUserData } = useMoralis();

  if (!isAuthenticated) {
    return <Reject />;
  } else if (
    user.get("userNameChange") === undefined ||
    user.get("userNameChange") === false
  ) {
    return <ConfigAccount />;
  }

  return (
    <div>
      <Head>
        <title>Profile</title>
      </Head>
      <Nav balance={false}/>
    </div>
  );
}