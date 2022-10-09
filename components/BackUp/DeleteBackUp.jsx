import React, { useState } from 'react'
import { useMoralis } from "react-moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEye, faEyeSlash, faCheck } from "@fortawesome/free-solid-svg-icons";
import AES from 'crypto-js/aes';
import ENC from 'crypto-js/enc-utf8'

const DeleteBackUp = ({ style, setOpenBackUpDelete }) => {
    const { user, setUserData } = useMoralis();
    const [see, setSee] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false);
    const [complete, setComplete] = useState(false);

    const decrypt = (crypted, password) => JSON.parse(AES.decrypt(crypted, password).toString(ENC)).content

    const deleteBackUp = () => {
        if (password.length > 7) {
            try {
                let data = JSON.parse(user.get("backup"))
                decrypt(data, password)
                setError("")
                setUserData({
                    backup: "",
                    backupdate: 0
                })
                setLoading(false);
                setComplete(true)
                setTimeout(() => {
                    setOpenBackUpDelete(false)
                }, 1500)
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
                {loading === false && complete === false && <>
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
                </>}
                {loading === true && complete === false && <div className={style.loadingContainer} style={{
                    "background": "transparent",
                }}>
                    <div className={style.loader} style={{
                        "borderTop": "15px solid #610433"
                    }}></div>
                </div>}
                {loading === false && complete === true && <div className={style.completeDiv}>
                    <p><FontAwesomeIcon icon={faCheck} /></p>
                    <button onClick={() => setOpenBackUpDelete(false)} className={style.closeBackUp}><FontAwesomeIcon icon={faTimes} /></button>
                </div>}
            </div>
        </div>
    )
}

export default DeleteBackUp