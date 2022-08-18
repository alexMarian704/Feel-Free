import { useRouter } from "next/router";
import React, { useState, useEffect } from 'react'
import { useInternetConnection } from "../../function/hooks/useInternetConnection";
import OfflineNotification from "../../components/OfflineNotification";
import Head from "next/head";
import { useMoralis } from "react-moralis";
import Reject from "../../components/Reject";
import ConfigAccount from "../../components/ConfigAccount";
import { Moralis } from "moralis";
import style from "../../styles/GroupChat.module.css"
import CheckPassword from "../../components/CheckPassword";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeartBroken , faHouseUser} from "@fortawesome/free-solid-svg-icons";

const Group = () => {
    const [member, setMember] = useState(true)
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, user } = useMoralis();
    const router = useRouter()
    const internetStatus = useInternetConnection()

    useEffect(async () => {
        if (isAuthenticated && router.query.id) {
            const GroupMembers = Moralis.Object.extend(`Group${router.query.id}`);
            const query = new Moralis.Query(GroupMembers);
            query.equalTo("type", "data");
            const results = await query.first();
            if (results === undefined) {
                setMember(false)
            }
            setLoading(false)
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
                "paddingTop":"100px",
                "fontSize":"calc(22px + 1vw)",
            }}>
                <h2 className={style.foundError}>Group not found</h2>
                <h2 className={style.foundError}><FontAwesomeIcon icon={faHeartBroken} /></h2>
                <button className={style.backToHome} onClick={()=> router.push("/")} >Back to <FontAwesomeIcon icon={faHouseUser }/></button>
            </div>
        )

    

    return (
        <div>
            {loading === false && <div>
                {router.query.id}
                {internetStatus === false && <OfflineNotification />}
            </div>}
        </div>

    )
}

export default Group