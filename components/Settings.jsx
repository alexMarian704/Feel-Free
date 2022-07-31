import React, { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import style from "../styles/Settings.module.css"
import SHA256 from 'crypto-js/sha256';
import Hex from "crypto-js/enc-hex"
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";

const Settings = ({ setSettings }) => {
    const { setUserData, user } = useMoralis();
    const [see, setSee] = useState(false)
    const [see1, setSee1] = useState(false)
    const [see2, setSee2] = useState(false)
    const [oldPassword, setOldPassword] = useState("");
    const [password, setPassword] = useState("");
    const [confrimPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [errorTag, setErrorTag] = useState("");
    const [newTag, setNewTag] = useState("")
    const [name, setName] = useState("");

    const chnagePassword = () => {
        const hashDigest = SHA256(password + user.id);
        const passwordHash = Hex.stringify(hashDigest)
        const oldHash = SHA256(oldPassword + user.id);
        const oldPasswordHash = Hex.stringify(oldHash);

        if (oldPasswordHash === user.get("passwordHash")) {
            if (password === confrimPassword && password.length >= 8) {
                setUserData({
                    passwordHash: passwordHash
                })
            } else if (password.length < 8) {
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

    const changeTag = async () => {
        const Tags = Moralis.Object.extend("Tags");
        const query = new Moralis.Query(Tags);
        query.equalTo("userTag", newTag);
        const results = await query.first();

        const userTag = Moralis.Object.extend("Tags");
        const queryUser = new Moralis.Query(userTag);
        queryUser.equalTo("ethAddress", user.get("ethAddress"));
        const resultTag = await queryUser.first();

        if (results === undefined && newTag.length > 3) {
            resultTag.set({
                userTag: newTag.toLowerCase().replace(/ /g, "")
            })
            resultTag.save();
            setUserData({
                userTag: newTag.toLowerCase().replace(/ /g, "")
            })
            setErrorTag("");
            setNewTag("")
        } else if (newTag.length <= 3) {
            setErrorTag("Tag too short")
        } else if (results !== undefined) {
            setErrorTag("Tag already in use");
        }
    }

    const chnageName = async () => {
        const userTag = Moralis.Object.extend("Tags");
        const queryUser = new Moralis.Query(userTag);
        queryUser.equalTo("ethAddress", user.get("ethAddress"));
        const resultTag = await queryUser.first();

        let splitName = name.split(" ")
        if (name !== "") {
            setUserData({
                username: name,
                searchName: name.toLowerCase(),
                name: splitName[0].toLowerCase(),
                name2: splitName[1] ? splitName[1].toLowerCase() : "",
            })
            resultTag.set({
                username: name,
                searchName: name.toLowerCase(),
                name: splitName[0].toLowerCase(),
                name2: splitName[1] ? splitName[1].toLowerCase() : "",
            })
            resultTag.save();
            setName("");
        }
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
                    <h2 style={{
                        "width": "100%",
                        "marginBottom": "10px",
                        "textAlign": "center",
                        "marginTop": "60px"
                    }}>Change tag</h2>
                    <div className={style.inputContainer}>
                        <label>New tag</label>
                        <br />
                        <div className={style.checkDiv}>
                            <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} className="setUpInput" />
                        </div>
                    </div>
                    <div className={style.changeDiv}>
                        <button className={style.change} onClick={changeTag}>Change tag</button>
                    </div>
                    <p>{errorTag}</p>
                </section>
                <section>
                    <h2 style={{
                        "width": "100%",
                        "marginBottom": "10px",
                        "textAlign": "center",
                        "marginTop": "60px"
                    }}>Change name</h2>
                    <div className={style.inputContainer}>
                        <label>Name</label>
                        <br />
                        <div className={style.checkDiv}>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="setUpInput" />
                        </div>
                    </div>
                    <div className={style.changeDiv}>
                        <button className={style.change} onClick={chnageName}>Change name</button>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Settings