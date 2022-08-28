import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import style from "../styles/Messages.module.css"
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { blockUser } from "../function/block.js"
import { unblockUser } from "../function/unblock.js"
import { useRouter } from "next/router";

export default function Options({ open, setOpen, userAddress, friendAddress, getBlock, setOpenMedia, setOpenConfirm,friendTag }) {
    const { setUserData, user } = useMoralis();
    const [error, setError] = useState("");
    const [mute, setMute] = useState(false);
    const [block, setBlock] = useState(false);
    const router = useRouter()

    const getMuteNotifications_blockUsers = async () => {
        const userNotification = Moralis.Object.extend("Tags");
        const query = new Moralis.Query(userNotification);
        query.equalTo("ethAddress", userAddress);
        const results = await query.first();
        if (results.attributes.muteNotification !== undefined) {
            if (results.attributes.muteNotification.includes(friendAddress))
                setMute(true);
            else
                setMute(false);
        }
        if (results.attributes.blockUsers !== undefined) {
            if (results.attributes.blockUsers.includes(friendAddress))
                setBlock(true);
            else
                setBlock(false);
        }
    }

    useEffect(() => {
        getMuteNotifications_blockUsers();
    }, [friendAddress])

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
        getMuteNotifications_blockUsers();
    }

    const turnOnNotifications = async () => {
        const userNotification = Moralis.Object.extend("Tags");
        const query = new Moralis.Query(userNotification);
        query.equalTo("ethAddress", userAddress);
        const results = await query.first();
        const filter = results.attributes.muteNotification.filter(x => x !== friendAddress)
        console.log(filter);
        results.set({
            muteNotification: filter
        })
        results.save().then(() => getMuteNotifications_blockUsers())
    }

    return (
        <div className={style.containers}>
            <button className={style.options} onClick={() => setOpen(!open)}><FontAwesomeIcon icon={faEllipsisV} /></button>
            <div className={style.optionsContainer} id={open === false ? style.close : style.open}>
                {block === false && <button onClick={() => blockUser(getMuteNotifications_blockUsers, friendAddress, userAddress, getBlock)}>Block</button>}
                {block === true && <button onClick={() => unblockUser(getMuteNotifications_blockUsers, friendAddress, userAddress, getBlock)}>Unblock</button>}
                <button onClick={() => {
                    setOpenMedia(true);
                    setOpen(false);
                }}>Media</button>
                <button onClick={() => {
                    router.push(`/transfer/${friendTag}`)
                }}>Transfer</button>
                {mute === false && <button onClick={muteNotifications}>Mute notifications</button>}
                {mute === true && <button onClick={turnOnNotifications} >Turn on notifications</button>}
                <button onClick={() => {
                    setOpenConfirm(true)
                    setOpen(false);
                }
                }>Delete chat</button>
            </div>
        </div>
    );
}