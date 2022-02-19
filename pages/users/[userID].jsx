import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from "next/head";
import { useMoralis } from "react-moralis";
import Reject from "../../components/Reject";
import ConfigAccount from "../../components/ConfigAccount";
import { Moralis } from "moralis";
import Nav from '../../components/Nav';
import style from "../../styles/UserId.module.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ProfilePicture from "../../public/profile.jpg";
import Image from "next/image";

export default function UserID() {
  const [userData, setUserData] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false)
  const { isAuthenticated, user, isInitialized } = useMoralis();
  const router = useRouter()

  const getData = async () => {
    if (isInitialized && router.query.userID) {
      setLoading(true);
      const addressToTag = Moralis.Object.extend("Tags");
      const query = new Moralis.Query(addressToTag);
      query.equalTo("ethAddress", router.query.userID);
      const results = await query.first();
      if (results !== undefined) {
        setUserData(results.attributes);
        setLoading(false);
      } else {
        setError("User was not found");
      }
    }
  }

  useEffect(() => {
    getData();
  }, [isInitialized, router.query.userID])

  let selectedChain
  if (user)
    selectedChain = user.get("chain");

  if (!isAuthenticated) {
    return <Reject />;
  } else if (
    user.get("userNameChange") === undefined ||
    user.get("userNameChange") === false
  ) {
    return <ConfigAccount />;
  }

  const addFriend = () => {
    
  }

  return (
    <div>
      <Head>
        <title>User profile</title>
      </Head>
      <Nav balance={false} />
      <div className="marginDiv"></div>
      {loading && <div className={style.loadingContainer}>
        <div className={style.loader}></div>
      </div>}
      {userData !== "" && loading === false &&
        <div>
          <div className={style.dataDiv}>
            <div className={style.alignImg}>
              {userData.profilePhoto !== undefined && <img src={userData.profilePhoto} alt="Profile Photo" />}
              {userData.profilePhoto == undefined && <Image src={ProfilePicture} alt="Profile Photo" />}
            </div>
            <div className={style.buttonDiv}>
              <button onClick={addFriend}>Add friend <FontAwesomeIcon icon={faUserPlus} /></button>
              <button>Send {selectedChain === "eth"
                ? "ETH"
                : selectedChain === "bsc"
                  ? "BNB"
                  : "MATIC"} <FontAwesomeIcon icon={faArrowRight} /></button>
            </div>
            <div className={style.mainData}>
              <p className={style.dataText}>Username: {userData.name} {userData.name2}</p>
              <p className={style.dataText}>Tag: @{userData.userTag}</p>
              <p className={style.dataText}>Adress: {router.query.userID}</p>
            </div>
          </div>
          <div></div>
        </div>}
    </div>
  )
}
