import React, { useState, useRef, useEffect } from "react";
import Nav from "../components/Nav";
import Head from "next/head";
import { useMoralis } from "react-moralis";
import Reject from "../components/Reject";
import ConfigAccount from "../components/ConfigAccount";
import { Moralis } from "moralis";
import Image from "next/image";
import style from "../styles/Profile.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { getBalance } from "../function/balance";
import ProfilePicture from "../public/profile.jpg";
import CheckPassword from "../components/CheckPassword";
import Notifications from "../components/Notifications";

export default function profile() {
  const { isAuthenticated, user, setUserData } = useMoralis();
  const fileRef = useRef();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [fetchBalance, setFetchBalance] = useState(false);

  if (!isAuthenticated) {
    return <Reject />;
  } else if (
    user.get("userNameChange") === undefined ||
    user.get("userNameChange") === false || user.get("passwordConfig") === undefined ||
    user.get("passwordConfig") === false
  ) {
    return <ConfigAccount />;
  }
  if(user.get("reCheck") === 1) return <CheckPassword />

  const changePhoto = async (e) => {
    const file = e.target.files[0];
    console.log(e.target.files[0]);
    const type = e.target.files[0].type.replace("image/", "");
    const name = `profile.${type}`;
    const profileFile = new Moralis.File(name, file);
    setLoading(true);
    await profileFile.saveIPFS();

    const UserTagData = Moralis.Object.extend("Tags");
    const query = new Moralis.Query(UserTagData);
    query.equalTo("userTag", user.get("userTag"));
    const results = await query.first();
    results.set("profilePhoto" , profileFile.ipfs())
    results.save();

    console.log(profileFile.ipfs());
    console.log(profileFile.hash());
    setUserData({
      profilePhoto: profileFile.ipfs(),
    });
    setLoading(false);
  };

  const userETHaddress = user.get("ethAddress");
  const selectedChain = user.get("chain");
  if (fetchBalance === false) {
    getBalance(userETHaddress).then((result) => {
      setBalance(result);
      setFetchBalance(true);
    });
  }

  return (
    <div>
      <Head>
        <title>Profile</title>
      </Head>
      <Nav
        getBalance={getBalance}
        userETHaddress={userETHaddress}
        setBalance={setBalance}
        balance={true}
      />
      <div className="marginDiv"></div>
      <div className={style.main}>
        <div className={style.imgProfile}>
          {user.get("profilePhoto") !== undefined && (
            <Image
              src={user.get("profilePhoto")}
              alt="profilePhoto"
              width="90%"
              height="90%"
              layout="fill"
              objectFit="cover"
              className={style.img}
            />
          )}
          {user.get("profilePhoto") === undefined && (
            <Image
              src={ProfilePicture}
              alt="profilePhoto"
              width="90%"
              height="90%"
              layout="fill"
              objectFit="cover"
              className={style.img}
            />
          )}
          {loading && (
            <div className={style.loadingContainer}>
              <div className={style.loader}></div>
            </div>
          )}
          <button
            onClick={() => {
              fileRef.current.click();
            }}
            className={style.change}
          >
            <FontAwesomeIcon icon={faCamera} color="white" />
          </button>
        </div>
        <input
          type="file"
          onChange={changePhoto}
          ref={fileRef}
          style={{
            display: "none",
          }}
        />
        <div className={style.dataUser}>
          <h2 className={style.address}>Username: {user.get("username")}</h2>
          <h2 className={style.address}>Tag: @{user.get("userTag")}</h2>
          <h2 className={style.address}>Address: {userETHaddress}</h2>
          <h2 className={style.address}>
            {selectedChain === "eth"
              ? "ETH"
              : selectedChain === "bsc"
              ? "BNB"
              : "MATIC"}{" "}
            Balance: {balance}
          </h2>
        </div>
      </div>
      <Notifications />
    </div>
  );
}
