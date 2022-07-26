import React, { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import style from "../styles/Settings.module.css"

const Settings = ({ setSettings }) => {
    const [see, setSee] = useState(false)
    const [see1, setSee1] = useState(false)
    const [see2, setSee2] = useState(false)
    const [oldPassword, setOldPassword] = useState("");
    const [password, setPassword] = useState("");
    const [confrimPassword, setConfirmPassword] = useState("");

    return (
        <div>
            <div className={style.main}>
                <button className={style.closeButton} onClick={() => setSettings(false)}><FontAwesomeIcon icon={faTimes} /></button>
                <h2 style={{
                    "marginBottom":"10px"
                }}>Chnage password</h2>
                <div>
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
                <div>
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
                <div>
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
                <button className={style.change}>Change</button>
            </div>
        </div>
    )
}

export default Settings