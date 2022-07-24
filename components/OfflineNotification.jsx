import React from 'react'
import style from "../styles/Offline.module.css"

const OfflineNotification = () => {
    return (
        <div className={style.container}>
            <div className={style.main}>
                <div>
                    <h2>You are offline</h2>
                </div>
                <div className={style.loadingContainer}>
                    <div className={style.loader}></div>
                </div>
            </div>
        </div>
    )
}

export default OfflineNotification;
