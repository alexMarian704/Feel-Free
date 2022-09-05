import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import Head from "next/head";
import { useMoralis } from "react-moralis";
import Reject from "../components/Reject";
import ConfigAccount from "../components/ConfigAccount";
import { Moralis } from "moralis";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import style from "../styles/Search.module.css";
import ProfilePicture from "../public/profile.jpg";
import { useRouter } from "next/router";
import CheckPassword from "../components/CheckPassword";
import Notifications from "../components/Notifications";
import { userStatus } from "../function/userStatus";
import { useInternetConnection } from "../function/hooks/useInternetConnection";
import OfflineNotification from "../components/OfflineNotification";
import UnsupportedChain from "../components/UnsupportedChain";

export default function search() {
  const { isAuthenticated, user, chainId, setUserData } = useMoralis();
  const [searchHistory, setSearchHistory] = useState([]);
  const [value, setValue] = useState("");
  const [tag, setTag] = useState("");
  const [nameArray, setNameArray] = useState([]);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([])
  const route = useRouter()
  const internetStatus = useInternetConnection()

  useEffect(async () => {
    if (isAuthenticated) {
      if (user.get("searchHistory") !== undefined) {
        let history = user.get("searchHistory");
        let pushArr = []
        for (let i = 0; i < history.length; i++) {
          const historyData = Moralis.Object.extend("Tags");
          const queryHistory = new Moralis.Query(historyData);
          queryHistory.equalTo("ethAddress", history[i]);
          const resultsHistory = await queryHistory.first();
          if (resultsHistory !== undefined) {
            pushArr.push(resultsHistory.attributes);
          }
        }
        setSearchHistory(pushArr);
      }
    }
  }, [isAuthenticated])

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

  const getUsers = async () => {
    if (value.trim() !== "") {
      const UserTagData = Moralis.Object.extend("Tags");
      const query = new Moralis.Query(UserTagData);
      query.equalTo("userTag", value.trim());
      const results = await query.first();
      if (results) {
        setTag(results.attributes);
        setError("")
      }

      const UserNameData = Moralis.Object.extend("Tags");
      const queryName = new Moralis.Query(UserNameData);
      queryName.equalTo("name", value.trim());
      const queryName2 = new Moralis.Query(UserNameData);
      queryName2.equalTo("name2", value.trim());
      const MainQuery = Moralis.Query.or(queryName, queryName2);
      const resultsName = await MainQuery.find();
      if (resultsName.length > 0) {
        let array = []
        for (let i = 0; i < resultsName.length; i++) {
          const object = resultsName[i];
          array.push(object.attributes)
        }
        if (array.length > 0) {
          setNameArray([...array]);
          setError("")
        }
      } else {
        setError("No results found")
      }
    }
  };

  const goToProfile = (eth) => {
    if (user.get("searchHistory") !== undefined) {
      if (user.get("searchHistory").includes(eth) === false)
        setUserData({
          searchHistory: [...user.get("searchHistory"), eth]
        })
    } else
      setUserData({
        searchHistory: [eth]
      })
    route.push(`/users/${eth}`)
  }

  const deleteHistory = (eth) => {
    setUserData({
      searchHistory: user.get("searchHistory").filter((x) => x !== eth)
    })
    setSearchHistory(searchHistory.filter((x) => x.ethAddress !== eth))
  }

  return (
    <div>
      <Head>
        <title>Search</title>
      </Head>
      <Nav balance={false} />
      <div className="marginDiv"></div>
      <div className={style.searchMain}>
        <h3>Search Users</h3>
        <div className={style.searchInput}>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Tag or name"
            onClick={userStatus}
            onKeyPress={e => {
              if (e.key === "Enter") {
                getUsers()
              }
            }}
          />
          <button onClick={getUsers}>
            <FontAwesomeIcon
              icon={faSearch}
              color="#800040"
              className={style.searchIcon}
            />
          </button>
        </div>
      </div>
      <div className={style.results}>
        {tag && (
          <div className={style.resultUser} onClick={() => goToProfile(tag.ethAddress)}>
            <div className={style.imgProfile}>
              {tag.profilePhoto !== undefined && (
                <Image
                  src={tag.profilePhoto}
                  alt="profilePhoto"
                  width="50%"
                  height="50%"
                  layout="fill"
                  objectFit="cover"
                  className={style.img}
                />
              )}
              {tag.profilePhoto === undefined && (
                <Image
                  src={ProfilePicture}
                  alt="profilePhoto"
                  width="50%"
                  height="50%"
                  layout="responsive"
                  objectFit="contain"
                  className={style.img}
                />
              )}
            </div>
            <div className={style.nameCon}>
              <p>Username: {tag.username}</p>
              <p>Tag: @{tag.userTag}</p>
            </div>
          </div>
        )}
        {nameArray.length > 0 &&
          <div>
            {nameArray.map((name, i) => (
              <div className={style.resultUser} onClick={() => goToProfile(name.ethAddress)} key={i}>
                <div className={style.imgProfile}>
                  {name.profilePhoto !== undefined && (
                    <Image
                      src={name.profilePhoto}
                      alt="profilePhoto"
                      width="50%"
                      height="50%"
                      layout="fill"
                      objectFit="cover"
                      className={style.img}
                    />
                  )}
                  {name.profilePhoto === undefined && (
                    <Image
                      src={ProfilePicture}
                      alt="profilePhoto"
                      width="50%"
                      height="50%"
                      layout="responsive"
                      objectFit="contain"
                      className={style.img}
                    />
                  )}
                </div>
                <div className={style.nameCon}>
                  <p>Username: {name.username}</p>
                  <p>Tag: @{name.userTag}</p>
                </div>
              </div>
            ))}
          </div>}
        {searchHistory.length > 0 && nameArray.length===0 && tag === "" &&
          <div>
            <h3 className={style.searchHistoryTitle}>Recent search:</h3>
            {searchHistory.map((name, i) => (
              <div className={style.resultUser} key={i}>
                <div className={style.imgProfile} onClick={() => goToProfile(name.ethAddress)} >
                  {name.profilePhoto !== undefined && (
                    <Image
                      src={name.profilePhoto}
                      alt="profilePhoto"
                      width="50%"
                      height="50%"
                      layout="fill"
                      objectFit="cover"
                      className={style.img}
                    />
                  )}
                  {name.profilePhoto === undefined && (
                    <Image
                      src={ProfilePicture}
                      alt="profilePhoto"
                      width="50%"
                      height="50%"
                      layout="responsive"
                      objectFit="contain"
                      className={style.img}
                    />
                  )}
                </div>
                <div className={style.nameCon} onClick={() => goToProfile(name.ethAddress)} >
                  <p>Username: {name.username}</p>
                  <p>Tag: @{name.userTag}</p>
                </div>
                <button className={style.deleteHistory} onClick={() => deleteHistory(name.ethAddress)}><FontAwesomeIcon icon={faTimes} /></button>
              </div>
            ))}
          </div>}
        {error && <p className={style.errorSearch}>{error}</p>}
      </div>
      <Notifications />
      {internetStatus === false && <OfflineNotification />}
      {(chainId !== null && chainId !== "0x4" && chainId !== "0x61" && chainId !== "0x13881") && <UnsupportedChain />}
    </div>
  );
}
