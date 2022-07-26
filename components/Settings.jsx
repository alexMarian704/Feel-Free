import React, { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import style from "../styles/Settings.module.css"
import SHA256 from 'crypto-js/sha256';
import Hex from "crypto-js/enc-hex"
import { useMoralis } from "react-moralis";

const Settings = ({ setSettings }) => {
    const { setUserData, user } = useMoralis();
    const [see, setSee] = useState(false)
    const [see1, setSee1] = useState(false)
    const [see2, setSee2] = useState(false)
    const [oldPassword, setOldPassword] = useState("");
    const [password, setPassword] = useState("");
    const [confrimPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const chnagePassword = () => {
        const hashDigest = SHA256(password + user.id);
        const passwordHash = Hex.stringify(hashDigest)
        const oldHash = SHA256(oldPassword + user.id);
        const oldPasswordHash = Hex.stringify(oldHash);

        if (oldPasswordHash === user.get("passwordHash")) {
            if (password === confrimPassword) {
                setUserData({
                    passwordHash: passwordHash
                })
            } else if (password < 8) {
                setError("The password should be at least 8 characters")
            }
            else {
                setError("The passwords should be the same")
            }
        } else {
            setError("Incorrect old password");
        }
        setOldPassword("")
        setPassword("")
        setConfirmPassword("")
    }

    return (
        <div>
            <div className={style.main}>
                <button className={style.closeButton} onClick={() => setSettings(false)}><FontAwesomeIcon icon={faTimes} /></button>
                <section>
                    <h2 style={{
                        "width": "100%",
                        "marginBottom": "10px",
                        "textAlign": "center"
                    }}>Change password</h2>
                    <div className={style.inputContainer}>
                        <label>Old password</label>
                        <br />
                        <div className={style.checkDiv}>
                            <input type={see === false ? "password" : "text"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="setUpInput" />
                            <button className="checkBut" onClick={() => setSee(!see)}>
                                {see === false ? (
                                    <FontAwesomeIcon icon={faEye} style={{ fontSize: 20 }} />
                                ) : (
                                    <FontAwesomeIcon icon={faEyeSlash} style={{ fontSize: 20 }} />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className={style.inputContainer}>
                        <label>New password</label>
                        <br />
                        <div className={style.checkDiv}>
                            <input type={see1 === false ? "password" : "text"} value={password} onChange={(e) => setPassword(e.target.value)} className="setUpInput" />
                            <button className="checkBut" onClick={() => setSee1(!see1)}>
                                {see1 === false ? (
                                    <FontAwesomeIcon icon={faEye} style={{ fontSize: 20 }} />
                                ) : (
                                    <FontAwesomeIcon icon={faEyeSlash} style={{ fontSize: 20 }} />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className={style.inputContainer}>
                        <label>Confirm password</label>
                        <br />
                        <div className={style.checkDiv}>
                            <input type={see2 === false ? "password" : "text"} value={confrimPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="setUpInput" />
                            <button className="checkBut" onClick={() => setSee2(!see2)}>
                                {see2 === false ? (
                                    <FontAwesomeIcon icon={faEye} style={{ fontSize: 20 }} />
                                ) : (
                                    <FontAwesomeIcon icon={faEyeSlash} style={{ fontSize: 20 }} />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className={style.changeDiv}>
                        <button className={style.change} onClick={chnagePassword}>Change</button>
                    </div>
                </section>
                <section>

                </section>
                <section>

                </section>
            </div>
        </div>
    )
}

export default Settings