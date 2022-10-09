import React, { useState } from 'react'
import { useMoralis } from "react-moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const BackUpInfo = ({ style, setOpenBackUp, setOpenBackUpModal, setOpenBackUpDelete }) => {
    const { user } = useMoralis();

    return (
        <div className={style.dataUser}>
            <button onClick={() => setOpenBackUp(false)} className={style.closeBackUp}><FontAwesomeIcon icon={faTimes} /></button>
            <h3>Last backup</h3>
            {user.get("backupdate") !== undefined && user.get("backupdate") !== 0  && <p>{new Date(user.get("backupdate")).toLocaleString()}</p>}
            {(user.get("backupdate") === undefined || user.get("backupdate") === 0 ) && <p>Never</p> }
            <button className={style.openBackUp} onClick={() => setOpenBackUpModal(true)}>Backup now</button>
            {user.get("backupdate") !== undefined && user.get("backupdate") !== 0 && <button className={style.openBackUp} onClick={() => setOpenBackUpDelete(true)}>Delete backup</button>}
        </div>
    )
}

export default BackUpInfo