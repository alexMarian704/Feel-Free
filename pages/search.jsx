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

export default function search() {
  const { isAuthenticated, user } = useMoralis();
  const [results , setResults] = useState([])
  const [value , setValue] = useState("")

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
        <title>Search</title>
      </Head>
      <Nav balance={false} />
      <div className="marginDiv"></div>
      <div className={style.searchMain} >
          <h3>Search Users</h3>
          <div className={style.searchInput}>
              <input type="text" value={value} onChange={(e)=> setValue(e.target.value)}/>
              <button><FontAwesomeIcon icon={faSearch} color="#800040" className={style.searchIcon}/></button>
          </div>
      </div>
      <div className={style.results}>

      </div>
    </div>
  );
}
