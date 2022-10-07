import React, { useState } from 'react'
import { useMoralis } from "react-moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import AES from 'crypto-js/aes';
import ENC from 'crypto-js/enc-utf8'

const BackUp = ({ style, setOpenBackUpModal }) => {
    const { user, setUserData } = useMoralis();
    const [see, setSee] = useState(false);
    const [password, setPassword] = useState("");

    const encrypt = (content, password) => AES.encrypt(JSON.stringify({ content }), password).toString()
    const decrypt = (crypted, password) => JSON.parse(AES.decrypt(crypted, password).toString(ENC)).content

    const getLocalStorageKey = () => {
        if (password.length > 7) {
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
            const encryptData = encrypt(arr , password);
            console.log(JSON.stringify(encryptData))
            setUserData({
                backup:JSON.stringify(encryptData),
                backupdate:time
            })
        }
    }

    return (
        <div className={style.backUpModal}>
            <div className="setUp">
                <h3 className="setUpTitle">Backup Password</h3>
                <div className="setUpContainer">
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
                    <button onClick={() => setOpenBackUpModal(false)} className={style.closeBackUp}><FontAwesomeIcon icon={faTimes} /></button>
                </div>
                <button onClick={getLocalStorageKey} className="setUpBut">Confirm</button>
                <p className="passwordWarning">You cannot access you backup if you forgot your password</p>
            </div>
        </div>
    )
}

export default BackUp