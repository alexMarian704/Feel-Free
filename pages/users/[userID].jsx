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
import { faUserPlus, faArrowRight, faUserSlash, faHourglass } from "@fortawesome/free-solid-svg-icons";
import ProfilePicture from "../../public/profile.jpg";
import Image from "next/image";
import CheckPassword from "../../components/CheckPassword";
import { userStatus } from '../../function/userStatus';
import { useInternetConnection } from "../../function/hooks/useInternetConnection";
import OfflineNotification from "../../components/OfflineNotification";

export default function UserID() {
  const [userData, setUserData] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false)
  const { isAuthenticated, user, isInitialized } = useMoralis();
  const router = useRouter()
  const [isFriend, setIsFriend] = useState(false);
  const [isSend, setIsSend] = useState(false);
  const internetStatus = useInternetConnection()

  if (user && router.query.userID === user.get("ethAddress")) router.push("/profile")

  const getData = async () => {
    if (isInitialized && router.query.userID && router.query.userID !== user.get("ethAddress")) {
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

  const getFriends = async () => {
    if (user && router.query.userID !== user.get("ethAddress")) {
      const userFriends = Moralis.Object.extend("Friends");
      const query = new Moralis.Query(userFriends);
      query.equalTo("ethAddress", user.get("ethAddress"));
      const results = await query.first();
      if (results.attributes.friendsArray.includes(router.query.userID))
        setIsFriend(true);
    }
  }

  const getRequest = async () => {
    const userRequest = Moralis.Object.extend("Notification");
    const query = new Moralis.Query(userRequest);
    query.equalTo("to", router.query.userID);
    const results = await query.first();
    if (results !== undefined)
      setIsSend(true);
    else
      setIsSend(false)
  }

  useEffect(() => {
    getData();
    if (isInitialized && router.query.userID) {
      getFriends();
      getRequest();
    }
  }, [isInitialized, router.query.userID , isAuthenticated])

  let selectedChain
  if (user)
    selectedChain = user.get("chain");

  if (!isAuthenticated) {
    return <Reject />;
  } else if (
    user.get("userNameChange") === undefined ||
    user.get("userNameChange") === false || user.get("passwordConfig") === undefined ||
    user.get("passwordConfig") === false
  ) {
    return <ConfigAccount />;
  }
  if (user.get("reCheck") === 1) return <CheckPassword />

  const addFriend = async () => {
    const Notification = Moralis.Object.extend("Notification");
    const noti = new Notification();
    noti.save({
      from: user.get("ethAddress"),
      to: router.query.userID,
      type: "Friend Request",
      tag: user.get("userTag")
    });

    const notificationsACL = new Moralis.ACL();
    notificationsACL.setWriteAccess(user.id, true);
    notificationsACL.setReadAccess(user.id, true)
    notificationsACL.setWriteAccess(userData.idUser, true);
    notificationsACL.setReadAccess(userData.idUser, true);
    noti.setACL(notificationsACL)
    noti.save();

    const MyFriends = Moralis.Object.extend("Friends");
    const query = new Moralis.Query(MyFriends);
    query.equalTo("ethAddress", user.get("ethAddress"));
    const results = await query.first();

    const FriendsACL = new Moralis.ACL();
    for (let i = 0; i < results.attributes.aclArray.length; i++) {
      FriendsACL.setReadAccess(results.attributes.aclArray[i], true);
      FriendsACL.setWriteAccess(results.attributes.aclArray[i], true)
    }
    let array = results.attributes.aclArray;
    array.push(userData.idUser)
    results.set({
      aclArray: array
    })

    FriendsACL.setReadAccess(userData.idUser, true);
    FriendsACL.setWriteAccess(userData.idUser, true)
    results.setACL(FriendsACL)
    results.save();

    setIsSend(true);
  }

  const removeACL = async (address, id, friend) => {
    const MyFriends = Moralis.Object.extend("Friends");
    const query = new Moralis.Query(MyFriends);
    query.equalTo("ethAddress", address);
    const results = await query.first();
    const FriendsACL = new Moralis.ACL();
    let array = [];
    let friendArray = []
    for (let i = 0; i < results.attributes.aclArray.length; i++) {
      if (results.attributes.aclArray[i] !== id) {
        FriendsACL.setReadAccess(results.attributes.aclArray[i], true);
        FriendsACL.setWriteAccess(results.attributes.aclArray[i], true);
        array.push(results.attributes.aclArray[i])
      }
    }
    for (let i = 0; i < results.attributes.friendsArray.length; i++) {
      if (results.attributes.friendsArray[i] !== friend) {
        friendArray.push(results.attributes.friendsArray[i])
      }
    }
    results.set({
      aclArray: array,
      friendsArray: friendArray
    })
    results.setACL(FriendsACL)
    results.save();
  }

  const removeFriend = async () => {
    removeACL(user.get("ethAddress"), userData.idUser, router.query.userID)
    removeACL(router.query.userID, user.id, user.get("ethAddress"))
    setIsFriend(false);
  }

  const removeRequest = async () => {
    const userRequest = Moralis.Object.extend("Notification");
    const query = new Moralis.Query(userRequest);
    query.equalTo("to", router.query.userID);
    const results = await query.first();
    if (results !== undefined)
      results.destroy().then(() => {
        getRequest();
      })
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
          <div className={style.dataDiv} >
            <br />
            <div className={style.alignImg} onClick={userStatus}>
              {userData.profilePhoto !== undefined && <Image src={userData.profilePhoto} alt="Profile Photo" width="90%"
              height="90%"
              layout="fill"
              objectFit="cover"/>}
              {userData.profilePhoto == undefined && <Image src={ProfilePicture} alt="Profile Photo" />}
            </div>
            <div className={style.buttonDiv} onClick={userStatus}>
              {isFriend === false && isSend === false && <button onClick={addFriend} className={style.redBut}>Add friend <FontAwesomeIcon icon={faUserPlus} /></button>}
              {isFriend === true && isSend === false && <button onClick={removeFriend} className={style.removeFriend}>Remove friend<FontAwesomeIcon icon={faUserSlash} className={style.butIcon} /></button>}
              {isSend === true && <button onClick={removeRequest} className={style.removeFriend}>Requested<FontAwesomeIcon icon={faHourglass} className={style.butIcon} /></button>}
              <button className={style.redBut} onClick={()=> router.push(`/transfer/${userData.userTag}`)}>Send {selectedChain === "eth"
                ? "ETH"
                : selectedChain === "bsc"
                  ? "BNB"
                  : "MATIC"} <FontAwesomeIcon icon={faArrowRight} /></button>
            </div>
            <div className={style.mainData}>
              <p className={style.dataText}>Username: {userData.username}</p>
              <p className={style.dataText}>Tag: @{userData.userTag}</p>
              <p className={style.dataText}>Adress: {router.query.userID}</p>
            </div>
          </div>
          <div></div>
        </div>}
        {internetStatus === false && <OfflineNotification /> }
    </div>
  )
}
