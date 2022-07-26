import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import SHA256 from 'crypto-js/sha256';
import Hex from "crypto-js/enc-hex"
import { useRouter } from "next/router";

export default function CheckPassword() {
  const { setUserData, user, logout } = useMoralis();
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [see, setSee] = useState(false);

  const confirmPassword = () => {
    const hashDigest = SHA256(password + user.id);
    const passwordHash = Hex.stringify(hashDigest)
    const d = new Date();
    let time = d.getTime();
    if (passwordHash === user.get("passwordHash") && password !== "") {
      setUserData({
        reCheck: 2,
        time: time
      })
      setError("");
    } else {
      setError("Incorrect password")
    }
  }

  const logOutUser = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="containerBlack">
      <div className="setUp">
        <h3 className="setUpTitle">Check password</h3>
        <div className="setUpContainer">
          <label>Password</label>
          <br />
          <div className="checkDiv">
            <input type={see === false ? "password" : "text"} value={password} onChange={(e) => setPassword(e.target.value)} className="setUpInput" onKeyPress={e => {
              if (e.key === "Enter") {
                confirmPassword();
              }
            }} />
            <button className="checkBut" onClick={() => setSee(!see)}>
              {see === false ? (
                <FontAwesomeIcon icon={faEye} style={{ fontSize: 20 }} />
              ) : (
                <FontAwesomeIcon icon={faEyeSlash} style={{ fontSize: 20 }} />
              )}
            </button>
          </div>
        </div>
        <button onClick={confirmPassword} className="setUpBut">Confirm</button>
        <button onClick={logOutUser} className="checkLogOut">Log out</button>
        {error && <p className="checkError">{error}</p>}
      </div>
    </div>
  );
}