import React, { useEffect, useState } from 'react';
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faTimes, faCheck, faCircle } from "@fortawesome/free-solid-svg-icons";
import style from "../styles/Notifications.module.css"
import { useRouter } from "next/router";
import { userStatus } from '../function/userStatus';

export default function Notifications() {
    const { user } = useMoralis();
    const [open, setOpen] = useState(false);
    const [notArray, setNotArray] = useState([]);
    const [idArray, setIdArray] = useState([])
    const route = useRouter()

    const queryNotifications = async () => {
        const userNotification = Moralis.Object.extend("Notification");
        const query = new Moralis.Query(userNotification);
        query.equalTo("to", user.get("ethAddress"));
        const results = await query.find();
        if (results !== undefined)
            setNotArray(results)

        const subscription = await query.subscribe()
        subscription.on("create", (object) => {
            if (idArray.includes(object.id) === false) {
                setIdArray([...idArray, object.id])
                setNotArray([...results, object])
            }
        })
    }

    useEffect(async () => {
        queryNotifications();
    }, [])

    const accept = async (address) => {
        const accFriend = Moralis.Object.extend("Friends");
        const query = new Moralis.Query(accFriend);
        query.equalTo("ethAddress", address);
        const results = await query.first();
        const array = [...results.attributes.friendsArray]
        array.push(user.get("ethAddress"))
        results.save({
            friendsArray: array
        })

        const addressToTag = Moralis.Object.extend("Tags");
        const queryTag = new Moralis.Query(addressToTag);
        queryTag.equalTo("ethAddress", address);
        const resultsTag = await queryTag.first();

        const mFriend = Moralis.Object.extend("Friends");
        const mquery = new Moralis.Query(mFriend);
        mquery.equalTo("ethAddress", user.get("ethAddress"));
        const mresults = await mquery.first();
        const marray = [...mresults.attributes.friendsArray]
        marray.push(address)
        mresults.save({
            friendsArray: marray
        })

        const FriendsACL = new Moralis.ACL();
        for (let i = 0; i < mresults.attributes.aclArray.length; i++) {
            FriendsACL.setReadAccess(mresults.attributes.aclArray[i], true);
            FriendsACL.setWriteAccess(mresults.attributes.aclArray[i], true)
        }
        let array1 = mresults.attributes.aclArray;
        array1.push(resultsTag.attributes.idUser)
        mresults.set({
            aclArray: array1
        })

        FriendsACL.setReadAccess(resultsTag.attributes.idUser, true);
        FriendsACL.setWriteAccess(resultsTag.attributes.idUser, true)
        mresults.setACL(FriendsACL)
        mresults.save();

        const userNotification = Moralis.Object.extend("Notification");
        const query1 = new Moralis.Query(userNotification);
        query1.equalTo("from", address);
        const results1 = await query1.first();
        results1.destroy().then(() => {
            queryNotifications();
        });

    }

    const reject = async (address) => {
        const userNotification = Moralis.Object.extend("Notification");
        const query1 = new Moralis.Query(userNotification);
        query1.equalTo("from", address);
        const results1 = await query1.first();
        results1.destroy();
    }

    const goToGroup = (eth , time)=>{
        route.push(`/group/${eth}${time}`)
    }

    return (
        <div className={style.main}>
            {open === true &&
                <div className={style.container} onClick={userStatus}>
                    {notArray.length === 0 && <p style={{
                        marginTop: "8px"
                    }}>0 notifications</p>}
                    {notArray.length > 0 &&
                        <div>
                            {notArray.map((x , i) => {
                                const data = x.attributes;
                                if (data.type === "Friend Request") {
                                    return (
                                        <div className={style.request} key={i}>
                                            <p>Friend Request from <span onClick={() => route.push(`/users/${data.from}`)}>@{data.tag}</span></p>
                                            <div className={style.butDiv}>
                                                <button className={style.accept} onClick={() => accept(data.from)}> <FontAwesomeIcon icon={faCheck} /></button>
                                                <button className={style.reject} onClick={() => reject(data.from)}><FontAwesomeIcon icon={faTimes} /></button>
                                            </div>
                                        </div>
                                    )
                                } else if (data.type === "New message") {
                                    return (
                                        <div className={style.newMessage} onClick={() => route.push(`/messages/${data.from}`)} key={i}>
                                            <p><FontAwesomeIcon icon={faCircle} className={style.dot} /> New messages from <span>@{data.tag}</span></p>
                                        </div>
                                    )
                                }else if(data.type === "New group"){
                                    return(
                                        <div className={style.newGroup} onClick={()=> goToGroup(data.from.slice(2) ,data.time)} key={i}>
                                            <p>You are now member of <span>{data.name}</span></p>
                                        </div>
                                    )
                                }else if(data.type === "Group message"){
                                    return(
                                        <div>
                                            <h1>Salut</h1>
                                        </div>
                                    )
                                }
                            })}
                        </div>}
                </div>}
            <button className={style.open} onClick={() => {
                setOpen(!open)
                userStatus()
            }
            }>
                <p className={style.notNumber}>{notArray.length}</p>
                <FontAwesomeIcon icon={faBell} color="white" />
            </button>
        </div>
    )
}
