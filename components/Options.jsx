import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import style from "../styles/Messages.module.css"
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

export default function Options({ open, setOpen, userAddress, friendAddress }) {
    const { setUserData, user } = useMoralis();
    const [error, setError] = useState("");
    const [mute, setMute] = useState(false);

    const getMuteNotifications = async () => {
        const userNotification = Moralis.Object.extend("Tags");
        const query = new Moralis.Query(userNotification);
        query.equalTo("ethAddress", userAddress);
        const results = await query.first();
        if (results.attributes.muteNotification !== undefined){
            if (results.attributes.muteNotification.includes(friendAddress))
                setMute(true);
            else
                setMute(false);
        }
    }

    useEffect(()=>{
        getMuteNotifications();
    },[friendAddress])

    const muteNotifications = async () => {
        const userNotification = Moralis.Object.extend("Tags");
        const query = new Moralis.Query(userNotification);
        query.equalTo("ethAddress", userAddress);
        const results = await query.first();
        if (results.attributes.muteNotification !== undefined) {
            results.set({
                muteNotification: [...results.attributes.muteNotification, friendAddress]
            })
            results.save()
        } else {
            results.set({
                muteNotification: [friendAddress]
            })
            results.save();
        }
        getMuteNotifications();
    }

    const turnOnNotifications = async ()=>{
        const userNotification = Moralis.Object.extend("Tags");
        const query = new Moralis.Query(userNotification);
        query.equalTo("ethAddress", userAddress);
        const results = await query.first();
        const filter = results.attributes.muteNotification.filter(x => x !== friendAddress)
        console.log(filter);
        results.set({
            muteNotification: filter
        })
        results.save().then(()=>getMuteNotifications())
    }

    return (
        <div className={style.containers}>
            <button className={style.options} onClick={() => setOpen(!open)}><FontAwesomeIcon icon={faEllipsisV} /></button>
            <div className={style.optionsContainer} id={open === false ? style.close : style.open}>
                <button>Block</button>
                <button>Media</button>
                {mute === false && <button onClick={muteNotifications}>Mute notifications</button>}
                {mute === true && <button onClick={turnOnNotifications} >Turn on notifications</button>}
                <button>Delete chat</button>
            </div>
        </div>
    );
}