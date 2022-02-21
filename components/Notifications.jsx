import React, { useEffect, useState } from 'react';
import Head from "next/head";
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import style from "../styles/Notifications.module.css"

export default function Notifications() {
    const { user } = useMoralis();
    const [open, setOpen] = useState(false);
    const [notArray , setNotArray] = useState([]);

    useEffect(async () => {
        const userNotification= Moralis.Object.extend("Notification");
        const query = new Moralis.Query(userNotification);
        query.equalTo("ethAddress", user.get("ethAddress"));
        const results = await query.first();
        setNotArray(results.toJSON().notifications)
    }, [])

    return (
        <div className={style.main}>
            {open === true &&
                <div className={style.container}>
                    {notArray.length === 0 && <p>0 notifications</p>}
                </div>}
            <button className={style.open} onClick={() => setOpen(!open)}>
                <FontAwesomeIcon icon={faBell} color="white" />
            </button>
        </div>
    )
}
