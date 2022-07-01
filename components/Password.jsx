import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import SHA256 from 'crypto-js/sha256';
import Hex from "crypto-js/enc-hex"

export default function PasswordConfig() {
  const { setUserData, user } = useMoralis();
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [see, setSee] = useState(false)
  const [seeC, setSeeC] = useState(false);

  const confirmPassword = () => {
    const hashDigest = SHA256(password + user.id);
    const passwordHash = Hex.stringify(hashDigest)
    console.log(passwordHash)
    const d = new Date();
    let time = d.getTime();
    //console.log((time-p)/1000/60/60)
    if (password === passwordCheck && password !== "") {
      setUserData({
        passwordHash: passwordHash,
        time: time,
        passwordConfig: true,
        reCheck: 2,
      })
      setError("");
    } else if (password === "") {
      setError("Set up a password")
    } else if (password.length < 8) {
      setError("The password should be at least 8 characters")
    } else if (password !== passwordCheck && password !== "") {
      setError("The passwords should be the same")
    }
  }

  return (
    <div className="setUp">
      <h3 className="setUpTitle">Set up a password</h3>
      <div className="setUpContainer">
        <label>Password</label>
        <br />
        <div className="checkDiv">
          <input type={see === false ? "password" : "text"} value={password} onChange={(e) => setPassword(e.target.value)} className="setUpInput" />
          <button className="checkBut" onClick={() => setSee(!see)}>
            {see === false ? (
              <FontAwesomeIcon icon={faEye} style={{ fontSize: 20 }} />
            ) : (
              <FontAwesomeIcon icon={faEyeSlash} style={{ fontSize: 20 }} />
            )}
          </button>
        </div>
        <br />
        <label>Confirm Password</label>
        <br />
        <div className="checkDiv">
          <input type={seeC === false ? "password" : "text"} value={passwordCheck} onChange={(e) => setPasswordCheck(e.target.value)} className="setUpInput" />
          <button className="checkBut" onClick={() => setSee(!seeC)}>
            {seeC === false ? (
              <FontAwesomeIcon icon={faEye} style={{ fontSize: 20 }} />
            ) : (
              <FontAwesomeIcon icon={faEyeSlash} style={{ fontSize: 20 }} />
            )}
          </button>
        </div>
      </div>
      <button onClick={confirmPassword} className="setUpBut">Confirm</button>
      {error && <p className="checkError">{error}</p>}
    </div>
  );
}