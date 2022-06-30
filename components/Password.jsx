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
    const d = new Date();
    let time = d.getTime();
    //console.log((time-p)/1000/60/60)
    if (password === passwordCheck && password !=="") {
      setUserData({
        passwordHash: passwordHash,
        time:time,
        passwordConfig:true,
        reCheck:2,
      })
      setError("");
    }else if(password === ""){
      setError("Set up a password")
    }else if(password.length < 8){
      setError("The password should be at least 8 characters")
    }else if(password !== passwordCheck && password!==""){
      setError("The passwords should be the same")
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
      {error && <p className="checkError">{error}</p>}
    </div>
  );
}