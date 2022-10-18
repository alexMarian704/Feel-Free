import React, { useState } from 'react'
import style from "../../styles/Profile.module.css";
import styleBackup from "../../styles/Backup.module.css";
import { useMoralis } from "react-moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEye, faEyeSlash, faCheck, faUpload } from "@fortawesome/free-solid-svg-icons";
import AES from 'crypto-js/aes';
import ENC from 'crypto-js/enc-utf8'
import { Moralis } from "moralis";

const LoadBackUp = ({ setImportBackUp, setBackUpView }) => {
  const { user, setUserData } = useMoralis();
  const [phase, setPhase] = useState(1);
  const [password, setPassword] = useState("");
  const [see, setSee] = useState(false);
  const [error, setError] = useState("")
  const [backupType, setBackUpType] = useState("cloud");
  const [paper, setPaper] = useState("")

  const decrypt = (crypted, password) => JSON.parse(AES.decrypt(crypted, password).toString(ENC)).content

  const importBackup = () => {
    if (password.length > 7) {
      try {
        let paperData = paper;
        if (backupType === "paper") {
          if (paper[0] !== `"`) {
            paperData = JSON.stringify(paper);
          } else if (paper[paper.length - 1] !== `"`) {
            paperData = paperData + `"`;
          }
        }
        const data = JSON.parse(backupType === "cloud" ? user.get("backup") : paperData);
        const backUp = decrypt(data, password)
        for (let i in backUp) {
          localStorage.setItem(backUp[i][0], backUp[i][1])
        }
        setImportBackUp(true)
        setError("")
        setPhase(3)
        setTimeout(() => {
          setBackUpView(false)
        }, 1500)
      } catch (err) {
        setError("Incorrect password or backup")
      }
    } else {
      setError("Password needs to be at least 8 characters")
    }
  }

  const genereteKeyPair = async () => {
    const keyPair = window.crypto.subtle.generateKey({
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
      true,
      ["encrypt", "decrypt"]
    );
    const { privateKey, publicKey } = await keyPair;

    const publicKeyJwk = await window.crypto.subtle.exportKey(
      "jwk",
      publicKey
    );
    const privateKeyJwk = await window.crypto.subtle.exportKey(
      "jwk",
      privateKey
    );
    const encrypt = (content, password) => AES.encrypt(JSON.stringify({ content }), password).toString()
    const encryptedPrivateKey = encrypt(privateKeyJwk, user.id);
    localStorage.setItem(`privateKeyUser${user.get("ethAddress")}`, encryptedPrivateKey)
    const formatPublicKey = JSON.stringify(publicKeyJwk)
    localStorage.setItem(`publicKeyUser${user.get("ethAddress")}`, formatPublicKey)
    setUserData({
      formatPublicKey: formatPublicKey
    })

    const userTag = Moralis.Object.extend("Tags");
    const queryUser = new Moralis.Query(userTag);
    queryUser.equalTo("ethAddress", user.get("ethAddress"));
    const resultTag = await queryUser.first();
    resultTag.save({
      formatPublicKey: formatPublicKey,
    })
  }

  return (
    <div className={style.backUpModal}>
      <div className="setUp">
        {phase === 1 && <>
          <h2 className={styleBackup.title}>It looks like you are logging from a new device</h2>
          <p className={styleBackup.upload}><FontAwesomeIcon icon={faUpload} /></p>
          <p className={styleBackup.text}>You need to import your backup</p>
          <button onClick={() => setPhase(2)} className={styleBackup.continue}>Continue</button>
        </>}
        {phase === 2 && <>
          <div className={style.backupType}>
            <button style={{
              "background": backupType === "paper" ? "transparent" : "white",
              "color": backupType === "paper" ? "grey" : "black"
            }} onClick={() => setBackUpType("cloud")}>Cloud backup</button>
            <button style={{
              "background": backupType === "cloud" ? "transparent" : "white",
              "color": backupType === "cloud" ? "grey" : "black"
            }} onClick={() => setBackUpType("paper")}>Paper backup</button>
          </div>
          {backupType === "cloud" && user.get("backup") !== undefined && user.get("backup") !== "" && <>
            <h2 className={styleBackup.title}>Backup found</h2>
            <p className={styleBackup.text}>Backup date: {new Date(user.get("backupdate")).toLocaleString()}</p>
            <div className="setUpContainer">
              <label>Backup Password</label>
              <br />
              <div className="checkDiv">
                <input type={see === false ? "password" : "text"} value={password} onChange={(e) => setPassword(e.target.value)} className="setUpInput" onKeyPress={e => {
                  if (e.key === "Enter") {
                    importBackup();
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
            <button style={{ "marginTop": "0px" }} className={styleBackup.continue} onClick={importBackup}>Import backup</button>
            {error && <p className="checkError">{error}</p>}
          </>}
          {backupType === "paper" && user.get("paperBackUp") !== undefined && <>
            <p className={styleBackup.text}>Backup date: {new Date(user.get("paperDate")).toLocaleString()}</p>
            <textarea className={styleBackup.paperTextarea} value={paper} onChange={(e) => setPaper(e.target.value)}></textarea>
            <div className="setUpContainer">
              <label>Backup Password</label>
              <br />
              <div className="checkDiv">
                <input type={see === false ? "password" : "text"} value={password} onChange={(e) => setPassword(e.target.value)} className="setUpInput" onKeyPress={e => {
                  if (e.key === "Enter") {
                    importBackup();
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
            <button style={{ "marginTop": "0px" }} className={styleBackup.continue} onClick={importBackup}>Import backup</button>
            {error && <p className="checkError">{error}</p>}
          </>}
          {backupType === "cloud" && (user.get("backup") === undefined || user.get("backup") === "") && <>
            <h2 className={styleBackup.title}>No backup found</h2>
            <p className={styleBackup.text}>If you have access to your old device make a backup on it and then import it hear</p>
            <p className={styleBackup.text}>This page will auto refresh when the back up is ready, you don't need to click anything</p>
            <button style={{ "marginTop": "30px", "width": "calc(240px + 2vw)" }} className={styleBackup.continue} onClick={genereteKeyPair}>I can't access my old device</button>
          </>}
          {backupType === "paper" && (user.get("paperBackUp") === undefined) && <>
            <h2 className={styleBackup.title}>No backup found</h2>
            <p className={styleBackup.text}>If you have access to your old device make a backup on it and then import it hear</p>
            <p className={styleBackup.text}>This page will auto refresh when the back up is ready, you don't need to click anything</p>
            <button style={{ "marginTop": "30px", "width": "calc(240px + 2vw)" }} className={styleBackup.continue}>I can't access my old device</button>
          </>}
        </>}
        {phase === 3 && <>
          <div className={style.completeDiv}>
            <p><FontAwesomeIcon icon={faCheck} /></p>
          </div>
        </>}
      </div>
    </div>
  )
}

export default LoadBackUp