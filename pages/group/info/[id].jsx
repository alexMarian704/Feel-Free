import { useRouter } from "next/router";
import React, { useState, useEffect } from 'react'
import OfflineNotification from "../../../components/OfflineNotification";
import { useInternetConnection } from "../../../function/hooks/useInternetConnection";
import Head from "next/head";
import { useMoralis } from "react-moralis";
import Reject from "../../../components/Reject";
import ConfigAccount from "../../../components/ConfigAccount";
import { Moralis } from "moralis";
import CheckPassword from "../../../components/CheckPassword";
import style from "../../../styles/GroupChat.module.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeartBroken, faHouseUser, faArrowLeft, faPen, faCheck } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import MembersAndMedia from "../../../components/Group/MembersAndMedia";


const GroupInfo = () => {
    const internetStatus = useInternetConnection()
    const { isAuthenticated, user, setUserData } = useMoralis();
    const [groupData, setGroupData] = useState("")
    const [notification, setNotification] = useState(true);
    const [editDescription, setEditDescription] = useState(false);
    const [description, setDescription] = useState("")
    const [member, setMember] = useState(true)
    const router = useRouter()

    useEffect(async () => {
        if (isAuthenticated && router.query.id) {
            const GroupData = Moralis.Object.extend(`Group${router.query.id}`);
            const query = new Moralis.Query(GroupData);
            query.equalTo("type", "data");
            const results = await query.first();
            if (results === undefined) {
                setMember(false)
            } else {
                setGroupData(results.attributes)
            }
            if (user.get("muteGroupNotification") !== undefined) {
                if (user.get("muteGroupNotification").includes(router.query.id)) {
                    setNotification(false)
                }
            }
        }
    }, [isAuthenticated, router.query.id])

    if (!isAuthenticated) {
        return <Reject />;
    } else if (
        user.get("userNameChange") === undefined ||
        user.get("userNameChange") === false || user.get("passwordConfig") === undefined ||
        user.get("passwordConfig") === false
    ) {
        return <ConfigAccount />;
    }
    if (user.get("reCheck") === 1) return <CheckPassword />
    if (member === false)
        return (
            <div style={{
                "paddingTop": "100px",
                "fontSize": "calc(22px + 1vw)",
            }}>
                <h2 className={style.foundError}>Group not found</h2>
                <h2 className={style.foundError}><FontAwesomeIcon icon={faHeartBroken} /></h2>
                <button className={style.backToHome} onClick={() => router.push("/")} >Back to <FontAwesomeIcon icon={faHouseUser} /></button>
            </div>
        )

    const changeNotificationGroup = async () => {
        const addressToTag = Moralis.Object.extend("Tags");
        const query = new Moralis.Query(addressToTag);
        query.equalTo("ethAddress", user.get("ethAddress"))
        const results = await query.first();
        if (results !== undefined) {
            if (results.attributes.muteGroupNotification !== undefined) {
                if (notification === true) {
                    results.save({
                        muteGroupNotification: [...results.attributes.muteGroupNotification, router.query.id]
                    })
                    setUserData({
                        muteGroupNotification: [...results.attributes.muteGroupNotification, router.query.id]
                    })
                } else {
                    results.save({
                        muteGroupNotification: results.attributes.muteGroupNotification.filter((x) => x !== router.query.id)
                    })
                    setUserData({
                        muteGroupNotification: results.attributes.muteGroupNotification.filter((x) => x !== router.query.id)
                    })
                }
            } else {
                results.save({
                    muteGroupNotification: [router.query.id]
                })
                setUserData({
                    muteGroupNotification: [router.query.id]
                })
            }
        }
        setNotification(!notification)
    }

    const saveDescription = async () => {
        setEditDescription(false)
        const GroupData = Moralis.Object.extend(`Group${router.query.id}`);
        const query = new Moralis.Query(GroupData);
        query.equalTo("type", "data");
        const results = await query.first();
        results.set("description", description);
        results.save();
    }

    return (
        <div>
            <button className={style.backButton} onClick={() => router.push(`/group/${router.query.id}`)
            } ><FontAwesomeIcon icon={faArrowLeft} /></button>
            {groupData !== "" && <div className={style.imageContainer}>
                <Image
                    src={groupData.image}
                    alt="groupImage"
                    width="90%"
                    height="90%"
                    layout="fill"
                    objectFit="cover"
                />
                <div className={style.groupMainInfo}>
                    <h3>{groupData.name}</h3>
                    <p>{groupData.members.length} members</p>
                </div>
                <div className={style.fade}></div>
            </div>}
            <div>
                {groupData !== "" && <div className={style.groupDescription}>
                    <h3>Description</h3>
                    {editDescription === false && <div className={style.descriptionContainer}>
                        <p>{description === "" ? groupData.description : description}</p>
                        {groupData.owner === user.get("ethAddress") && <FontAwesomeIcon icon={faPen} className={style.editDescription} onClick={() => {
                            setDescription(groupData.description)
                            setEditDescription(true)
                        }} />}
                    </div>}
                    {editDescription === true && <div className={style.texteraContainer}>
                        <textarea spellCheck="false" cols="30" rows="10" className={style.descriptionTextarea} value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                        <button onClick={saveDescription}><FontAwesomeIcon icon={faCheck} /></button>
                    </div>}
                </div>}
                <div className={style.groupNotifications}>
                    <div>
                        <h3>Notifications</h3>
                        <label className="switch">
                            <input type="checkbox" className="switch-input" onChange={changeNotificationGroup} checked={notification} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <p>{notification === true ? "On" : "Off"}</p>
                </div>
                <MembersAndMedia members={groupData.members} />
            </div>
            {internetStatus === false && <OfflineNotification />}
        </div>
    )
}

export default GroupInfo