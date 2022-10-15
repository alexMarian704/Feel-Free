import React, { useState } from 'react'
import { useMoralis } from "react-moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEye, faEyeSlash, faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import AES from 'crypto-js/aes';
import ENC from 'crypto-js/enc-utf8'

const BackUp = ({ style, setOpenBackUpModal }) => {
    const { user, setUserData } = useMoralis();
    const [see, setSee] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [complete, setComplete] = useState(false);
    const [backupType, setBackUpType] = useState("cloud");
    const [paper, setPaper] = useState("")

    const encrypt = (content, password) => AES.encrypt(JSON.stringify({ content }), password).toString()
    const decrypt = (crypted, password) => JSON.parse(AES.decrypt(crypted, password).toString(ENC)).content

    const getLocalStorageKey = () => {
        if (password.length > 7) {
            setLoading(true);
            const d = new Date();
            let time = d.getTime();

            const eth = user.get("ethAddress")
            let arr = []
            for (let key in localStorage) {
                if (key.includes(eth)) {
                    arr.push([key, localStorage.getItem(key)])
                }
            }
            const messageOrder = JSON.parse(localStorage.getItem(`${eth}Order`))
            for (let i = 0; i < messageOrder.length; i++) {
                if (messageOrder[i].type === "group") {
                    arr.push([`Group${messageOrder[i].groupRef}Key`, localStorage.getItem(`Group${messageOrder[i].groupRef}Key`)])
                    arr.push([`Group${messageOrder[i].groupRef}Messages`, localStorage.getItem(`Group${messageOrder[i].groupRef}Messages`)])
                } else {
                    arr.push([`${messageOrder[i].chat}${eth}`, localStorage.getItem(`${messageOrder[i].chat}${eth}`)])
                }
            }
            const encryptData = encrypt(arr, password);
            console.log(JSON.stringify(encryptData))
            if (backupType === "cloud") {
                setUserData({
                    backup: JSON.stringify(encryptData),
                    backupdate: time
                })
                setError("")
                setLoading(false);
                setComplete(true)
                setTimeout(() => {
                    setOpenBackUpModal(false)
                }, 1500)
            } else {
                setUserData({
                    paperBackUp: true,
                    paperDate: time
                })
                setPaper(JSON.stringify(encryptData));
                setLoading(false);
                setComplete(true)
            }
        } else {
            setError("Password needs to be at least 8 characters")
        }
    }

    const copyFunction = () => {
        navigator.clipboard.writeText(paper);
      };

    return (
        <div className={style.backUpModal}>
            <div className="setUp">
                {loading === false && complete === false && <>
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
                    <h3 className="setUpTitle">Backup Password</h3>
                    <div className="setUpContainer">
                        <div className="checkDiv">
                            <input type={see === false ? "password" : "text"} value={password} onChange={(e) => setPassword(e.target.value)} className="setUpInput" onKeyPress={e => {
                                if (e.key === "Enter") {
                                    getLocalStorageKey()
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
                        <button onClick={() => setOpenBackUpModal(false)} className={style.closeBackUp}><FontAwesomeIcon icon={faTimes} /></button>
                    </div>
                    <button onClick={getLocalStorageKey} className="setUpBut">Confirm</button>
                    <p className="passwordWarning">You cannot access you backup if you forgot your password</p>
                </>}
                {loading === true && complete === false && <div className={style.loadingContainer} style={{
                    "background": "transparent",
                }}>
                    <div className={style.loader} style={{
                        "borderTop": "15px solid #610433"
                    }}></div>
                </div>}
                {loading === false && complete === true && paper === "" && <div className={style.completeDiv}>
                    <p><FontAwesomeIcon icon={faCheck} /></p>
                    <button onClick={() => setOpenBackUpModal(false)} className={style.closeBackUp}><FontAwesomeIcon icon={faTimes} /></button>
                </div>}
                {loading === false && complete === true && paper !== "" && <>
                    <p className={style.text}>Copy the backup and store it somewhere safe</p>
                    <div className={style.paperDiv}>
                        <p>{paper}</p>
                        <button onClick={copyFunction}><FontAwesomeIcon icon={faCopy} /></button>
                    </div>
                    <button onClick={() => setOpenBackUpModal(false)} className={style.closeBackUp}><FontAwesomeIcon icon={faTimes} /></button>
                </>}
            </div>
        </div>
    )
}

export default BackUp