import React, { useEffect, useState } from 'react';
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import style from "../styles/Notifications.module.css"
import { useRouter } from "next/router";

export default function Notifications() {
    const { user } = useMoralis();
    const [open, setOpen] = useState(false);
    const [notArray, setNotArray] = useState([]);
    const route = useRouter()

    useEffect(async () => {
        const userNotification = Moralis.Object.extend("Notification");
        const query = new Moralis.Query(userNotification);
        query.equalTo("to", user.get("ethAddress"));
        const results = await query.find();
        if (results !== undefined)
            setNotArray(results)
    }, [])

    const accept = ()=>{

    }

    const reject = ()=>{
        
    }

    return (
        <div className={style.main}>
            {open === true &&
                <div className={style.container}>
                    {notArray.length === 0 && <p>0 notifications</p>}
                    {notArray.length > 0 &&
                        <div>
                            {notArray.map((x) => {
                                const data = x.attributes;
                                if (data.type === "Friend Request") {
                                    return (
                                        <div className={style.request} key={data.from}>
                                            <p>Friend Request from <span onClick={() => route.push(`/users/${data.from}`)}>@{data.tag}</span></p>
                                            <div className={style.butDiv}>
                                                <button className={style.accept}> <FontAwesomeIcon icon={faCheck} /></button>
                                                <button className={style.reject}><FontAwesomeIcon icon={faTimes} /></button>
                                            </div>
                                        </div>
                                    )
                                }
                            })}
                        </div>}
                </div>}
            <button className={style.open} onClick={() => setOpen(!open)}>
                <p className={style.notNumber}>{notArray.length}</p>
                <FontAwesomeIcon icon={faBell} color="white" />
            </button>
        </div>
    )
}
