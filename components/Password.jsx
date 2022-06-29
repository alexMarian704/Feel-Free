import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SHA256 from 'crypto-js/sha256';
import Hex from "crypto-js/enc-hex"

export default function PasswordConfig({ setInfo }) {
  const { setUserData, user } = useMoralis();
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");

  const confirmPassword = () => {
    const hashDigest = SHA256(password);
    const passwordHash = Hex.stringify(hashDigest)
    console.log(passwordHash)
    if(password === passwordCheck){
      console.log(true)
    }
  }

  return (
    <div className="setUp">
      <h3 className="setUpTitle">Set up a password</h3>
      <div className="setUpContainer">
        <label>Password</label>
        <br />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="setUpInput" />
        <br />
        <label>Confirm Password</label>
        <br />
        <input type="password" value={passwordCheck} onChange={(e) => setPasswordCheck(e.target.value)} className="setUpInput" />
      </div>
      <button onClick={confirmPassword} className="setUpBut">Confirm</button>
    </div>
  );
}