import React, { useState } from 'react'
import { useMoralis } from "react-moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const BackUpInfo = ({ style, setOpenBackUp, setOpenBackUpModal }) => {
    const { user } = useMoralis();

    return (
        <div className={style.dataUser}>
            <button onClick={() => setOpenBackUp(false)} className={style.closeBackUp}><FontAwesomeIcon icon={faTimes} /></button>
            <h3>Last backup</h3>
            {user.get("backupdate") !== undefined && <p>{new Date(user.get("backupdate")).toLocaleDateString()}</p> }
            {user.get("backupdate") === undefined && <p>Never</p> }
            <button className={style.openBackUp} onClick={() => setOpenBackUpModal(true)}>Back up now</button>
        </div>
    )
}

export default BackUpInfo