import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import Head from "next/head";
import { useMoralis } from "react-moralis";
import Reject from "../components/Reject";
import ConfigAccount from "../components/ConfigAccount";
import { Moralis } from "moralis";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
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
  const { isAuthenticated, user,chainId } = useMoralis();
  const [results, setResults] = useState([]);
  const [value, setValue] = useState("");
  const [tag, setTag] = useState("");
  const [nameArray, setNameArray] = useState([]);
  const [error, setError] = useState("");
  const route = useRouter()
  const internetStatus = useInternetConnection()

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
    const UserTagData = Moralis.Object.extend("Tags");
    const query = new Moralis.Query(UserTagData);
    query.equalTo("userTag", value);
    const results = await query.first();
    if (results) {
      setTag(results.attributes);
      setError("")
    }
    //else {
    const UserNameData = Moralis.Object.extend("Tags");
    const queryName = new Moralis.Query(UserNameData);
    queryName.equalTo("name", value);
    const queryName2 = new Moralis.Query(UserNameData);
    queryName2.equalTo("name2", value);
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
    // }
  };

  const goToProfile = (eth) => {
    route.push(`/users/${eth}`)
  }

  console.log(nameArray)

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
              <div className={style.resultUser} onClick={() => goToProfile(tag.ethAddress)} key={i}>
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
        {error && <p className={style.errorSearch}>{error}</p>}
      </div>
      <Notifications />
      {internetStatus === false && <OfflineNotification />}
      {(chainId !== null && chainId !== "0x41" &&  chainId !== "0x61" && chainId !== "0x13881") && <UnsupportedChain />}
    </div>
  );
}
