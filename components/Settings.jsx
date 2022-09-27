import React, { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEye, faEyeSlash, faCheck } from "@fortawesome/free-solid-svg-icons";
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
    const [animate, setAnimate] = useState(false);
    const [lastSeen, setLastSeen] = useState(user.get("lastSeen") === false ? false : true);

    const chnagePassword = () => {
        const hashDigest = SHA256(password.trim() + user.id);
        const passwordHash = Hex.stringify(hashDigest)
        const oldHash = SHA256(oldPassword + user.id);
        const oldPasswordHash = Hex.stringify(oldHash);

        if (oldPasswordHash === user.get("passwordHash")) {
            if (password === confrimPassword && password.trim().length >= 8) {
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
        setAnimate(true)
        setTimeout(() => {
            setAnimate(false)
        }, 1100)
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
            setAnimate(true)
            setTimeout(() => {
                setAnimate(false)
            }, 1100)
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
            setAnimate(true)
            setTimeout(() => {
                setAnimate(false)
            }, 1100)
            setName("");
        }
    }

    const changeLastSeen = async () => {
        const d = new Date();
        let time = d.getTime();

        if (user.get("lastSeen") === undefined || (time-user.get("lastSeenChange"))/1000/60/60/24 >= 2 ) {
            setUserData({
                lastSeen: !lastSeen,
                lastSeenChange: time
            })
            const userTag = Moralis.Object.extend("Tags");
            const queryUser = new Moralis.Query(userTag);
            queryUser.equalTo("ethAddress", user.get("ethAddress"));
            const resultTag = await queryUser.first();
            resultTag.set({
                lastSeen: !lastSeen,
                lastSeenChange: time
            })
            resultTag.save();

            setLastSeen(!lastSeen)
        }
    }

    return (
        <div>
            <div className={style.main}>
                <button className={style.closeButton} onClick={() => setSettings(false)}><FontAwesomeIcon icon={faTimes} /></button>
                <div className={style.category}>
                    <h2 className={style.sectionTitle} >Security</h2>
                    <section>
                        <h2 style={{
                            "width": "100%",
                            "marginBottom": "10px",
                            "textAlign": "left",
                        }}>Change password</h2>
                        <div className={style.inputContainer}>
                            <label>Old password</label>
                            <br />
                            <div className={style.checkDiv}>
                                <input type={see === false ? "password" : "text"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                                <button onClick={() => setSee(!see)}>
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
                                <input type={see1 === false ? "password" : "text"} value={password} onChange={(e) => setPassword(e.target.value)} />
                                <button onClick={() => setSee1(!see1)}>
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
                                <input type={see2 === false ? "password" : "text"} value={confrimPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                <button onClick={() => setSee2(!see2)}>
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
                </div>
                <div className={style.category}>
                    <h2 className={style.sectionTitle}>Public profile</h2>
                    <section>
                        <h2 style={{
                            "width": "100%",
                            "marginBottom": "10px",
                            "textAlign": "left",
                            "marginTop": "10px"
                        }}>Change tag</h2>
                        <div className={style.inputContainer}>
                            <label>New tag</label>
                            <br />
                            <div className={style.checkDiv}>
                                <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} />
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
                            "textAlign": "left",
                            "marginTop": "10px"
                        }}>Change name</h2>
                        <div className={style.inputContainer}>
                            <label>Name</label>
                            <br />
                            <div className={style.checkDiv}>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                        </div>
                        <div className={style.changeDiv}>
                            <button className={style.change} onClick={chnageName}>Change name</button>
                        </div>
                    </section>
                </div>
                <div className={style.category}>
                    <h2 className={style.sectionTitle}>Privacy</h2>
                    <section>
                        <div className={style.lastSeenContainer}>
                            <h2 style={{
                                "width": "100%",
                                "marginBottom": "10px",
                                "textAlign": "left",
                                "marginTop": "10px"
                            }}>Last seen</h2>
                            <label className="switch">
                                <input type="checkbox" className="switch-input" onChange={changeLastSeen} checked={lastSeen} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className={style.inputContainer}>
                            <p className={style.lastSeenInfo}>You can change this setting once every 2 days</p>
                        </div>
                    </section>
                </div>
            </div>
            <div className={style.animate} style={{
                "transform": animate === false ? "scale(0)" : "scale(1)"
            }}>
                <div className={animate === true ? style.animateDotCheck : style.animateDot}>
                    <FontAwesomeIcon icon={faCheck} />
                </div>
            </div>
        </div>
    )
}

export default Settings