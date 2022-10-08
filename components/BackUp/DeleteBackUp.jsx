import React, { useState } from 'react'
import { useMoralis } from "react-moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import AES from 'crypto-js/aes';
import ENC from 'crypto-js/enc-utf8'

const DeleteBackUp = ({ style, setOpenBackUpDelete }) => {
    const { user, setUserData } = useMoralis();
    const [see, setSee] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("")

    const decrypt = (crypted, password) => JSON.parse(AES.decrypt(crypted, password).toString(ENC)).content

    const deleteBackUp = () => {
        if (password.length > 7) {
            try {
                let data = JSON.parse(user.get("backup"))
                decrypt(data, password)
                setError("")
                setUserData({
                    backup:"",
                    backupdate:0
                })
                setOpenBackUpDelete(false)
            } catch (err) {
                setError("Incorrect password")
            }
        } else {
            setError("Password needs to be at least 8 characters")
        }
    }

    return (
        <div className={style.backUpModal}>
            <div className="setUp">
                <h3 className="setUpTitle">Backup Password Check</h3>
                <div className="setUpContainer">
                    <div className="checkDiv">
                        <input type={see === false ? "password" : "text"} value={password} onChange={(e) => setPassword(e.target.value)} className="setUpInput" onKeyPress={e => {
                            if (e.key === "Enter") {
                                deleteBackUp();
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
                    <button onClick={() => setOpenBackUpDelete(false)} className={style.closeBackUp}><FontAwesomeIcon icon={faTimes} /></button>
                </div>
                <button onClick={deleteBackUp} className="setUpBut">Confirm</button>
                {error && <p className="checkError">{error}</p>}
                {error === "" && <p className="passwordWarning">To delete your backup you need to confirm your backup password</p>}
            </div>
        </div>
    )
}

export default DeleteBackUp