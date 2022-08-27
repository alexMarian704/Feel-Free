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
import { userStatus } from "../function/userStatus";
import { useInternetConnection } from "../function/hooks/useInternetConnection";
import OfflineNotification from "../components/OfflineNotification";
import { FiSettings } from 'react-icons/fi';
import Settings from "../components/Settings";
import UnsupportedChain from "../components/UnsupportedChain";


export default function profile() {
  const { isAuthenticated, user, setUserData,chainId } = useMoralis();
  const fileRef = useRef();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const internetStatus = useInternetConnection()
  const [settings , setSettings] = useState(false);

  useEffect(()=>{
    if (isAuthenticated && chainId!== null) {
      getBalance(userETHaddress,chainId).then((result) => {
        setBalance(result);
      });
    }
  },[isAuthenticated , chainId])

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
      {settings === false && <div className={style.main}>
        <div className={style.imgProfile} onClick={userStatus}>
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
        <div className={style.dataUser} onClick={userStatus}>
          <h2 className={style.address}>Username: {user.get("username")}</h2>
          <h2 className={style.address}>Tag: @{user.get("userTag")}</h2>
          <h2 className={style.address}>Address: {userETHaddress}</h2>
          <h2 className={style.address}>
            {chainId === "0x4"
              ? "ETH"
              : chainId === "0x61"
              ? "BNB"
              : "MATIC"}{" "}
            Balance: {balance}
          </h2>
          <button onClick={()=> setSettings(true)} className={style.settingButton}><FiSettings /></button>
        </div>
      </div>}
      {settings === true && <Settings setSettings={setSettings} />}
      {settings === false &&<Notifications />}
      {internetStatus === false && <OfflineNotification /> }
      {(chainId !== null && chainId !== "0x4" &&  chainId !== "0x61" && chainId !== "0x13881") && <UnsupportedChain />}
    </div>
  );
}
