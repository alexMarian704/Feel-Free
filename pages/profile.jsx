import React, { useState } from "react";
import Nav from "../components/Nav";
import Head from "next/head";
import { useMoralis } from "react-moralis";
import Reject from "../components/Reject";
import ConfigAccount from "../components/ConfigAccount";
import { Moralis } from "moralis";
import Image from "next/image";

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

  const changePhoto = async (e) => {
    const file = e.target.files[0];
    console.log(e.target.files[0]);
    const type = e.target.files[0].type.replace("image/", "");
    const name = `profile.${type}`;
    const profileFile = new Moralis.File(name, file);
    await profileFile.saveIPFS();
    console.log(profileFile.ipfs());
    console.log(profileFile.hash());
    setUserData({
      profilePhoto: profileFile.ipfs(),
    });
  };

  return (
    <div>
      <Head>
        <title>Transfer</title>
      </Head>
      <Nav />
      <div className="marginDiv"></div>
      <h1>profile</h1>
      <div className="imgMeta">
        {user.get("profilePhoto") !== undefined && (
          <Image
            src={user.get("profilePhoto")}
            alt="profilePhoto"
            width="90%" height="90%" layout="responsive"
            objectFit="contain"
          />
        )}
      </div>
        <input type="file" onChange={changePhoto} />
    </div>
  );
}
