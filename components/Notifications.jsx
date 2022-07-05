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

    const queryNotifications = async ()=>{
        const userNotification = Moralis.Object.extend("Notification");
        const query = new Moralis.Query(userNotification);
        query.equalTo("to", user.get("ethAddress"));
        const results = await query.find();
        if (results !== undefined)
            setNotArray(results)
    }

    useEffect(async () => {
        queryNotifications();
    }, [])

    const accept = async (address)=>{
        const accFriend = Moralis.Object.extend("Friends");
        const query = new Moralis.Query(accFriend);
        query.equalTo("ethAddress", address);
        const results = await query.first();
        const array = [...results.attributes.friendsArray]
        array.push(user.get("ethAddress"))
        results.save({
            friendsArray:array
        })

        const mFriend = Moralis.Object.extend("Friends");
        const mquery = new Moralis.Query(mFriend);
        mquery.equalTo("ethAddress", user.get("ethAddress"));
        const mresults = await mquery.first();
        const marray = [...mresults.attributes.friendsArray]
        marray.push(address)
        mresults.save({
            friendsArray:marray
        })

        const userNotification = Moralis.Object.extend("Notification");
        const query1 = new Moralis.Query(userNotification);
        query1.equalTo("from", address);
        const results1 = await query1.first();
        results1.destroy().then(()=>{
            queryNotifications();
        });

    }

    const reject = async (address)=> {
        const userNotification = Moralis.Object.extend("Notification");
        const query1 = new Moralis.Query(userNotification);
        query1.equalTo("from", address);
        const results1 = await query1.first();
        results1.destroy();
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
                                                <button className={style.accept} onClick={() => accept(data.from)}> <FontAwesomeIcon icon={faCheck} /></button>
                                                <button className={style.reject} onClick={()=> reject(data.from)}><FontAwesomeIcon icon={faTimes} /></button>
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
