import React, { useState, useEffect } from 'react'
import { useInternetConnection } from "../../function/hooks/useInternetConnection";
import OfflineNotification from "../../components/OfflineNotification";
import { useRouter } from 'next/router';
import Head from "next/head";
import { useMoralis } from "react-moralis";
import Reject from "../../components/Reject";
import ConfigAccount from "../../components/ConfigAccount";
import { Moralis } from "moralis";
import style from "../../styles/Group.module.css"
import ProfilePicture from "../../public/profile.jpg";
import Image from "next/image";
import CheckPassword from "../../components/CheckPassword";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSearch , faCheck } from "@fortawesome/free-solid-svg-icons";

const Group = () => {
    const [openSearch, setOpenSearch] = useState(false);
    const [selectFriend, setSelectFriend] = useState([])
    const [friendList, setFriendList] = useState(0);
    const { isAuthenticated, user, isInitialized } = useMoralis();
    const router = useRouter()
    const internetStatus = useInternetConnection()

    const getFriend = async () => {
        const UserFriends = Moralis.Object.extend("Friends");
        const query = new Moralis.Query(UserFriends);
        query.equalTo("ethAddress", user.get("ethAddress"));
        const result = await query.first();
        if (result.attributes.friendsArray.length > 0) {
            let array = []
            for (let i = 0; i < result.attributes.friendsArray.length; i++) {
                const addressToTag = Moralis.Object.extend("Tags");
                const query = new Moralis.Query(addressToTag);
                query.equalTo("ethAddress", result.attributes.friendsArray[i]);
                const results = await query.first();
                if (results !== undefined) {
                    array.push(results.attributes);
                }
            }
            setFriendList(array);
        }
        else {
            setFriendList(1);
        }
    }

    useEffect(() => {
        if (isAuthenticated && user)
            getFriend();
    }, [isAuthenticated, user])

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

    const select = (eth) => {
        if (selectFriend.includes(eth) === false) {
            setSelectFriend([...selectFriend, eth])
        } else {
            setSelectFriend(selectFriend.filter((x) => x !== eth))
        }
    }

    return (
        <div>
            <Head>
                <title>Create group</title>
            </Head>
            <div className={style.nav}>
                <div>
                    <button onClick={() => router.push("/")} className={style.backBut}><FontAwesomeIcon icon={faArrowLeft} /></button>
                    {openSearch === false && <h4>Create group</h4>}
                    {openSearch === true && <input type="text" placeholder='Search' />}
                </div>
                <button className={style.search} onClick={() => { setOpenSearch(!openSearch) }}
                ><FontAwesomeIcon icon={faSearch} /></button>
            </div>
            <div>
                {friendList !== 0 && friendList !== 1 &&
                    <div>
                        {friendList.map((friend) => (
                            <div key={friend.userTag} className={style.friendContainer} onClick={() => select(friend.ethAddress)}>
                                <div className={style.imgProfile}>
                                    {friend.profilePhoto !== undefined && (
                                        <Image
                                            src={friend.profilePhoto}
                                            alt="profilePhoto"
                                            width="50%"
                                            height="50%"
                                            layout="fill"
                                            objectFit="cover"
                                            className={style.img}
                                        />
                                    )}
                                    {friend.profilePhoto === undefined && (
                                        <Image
                                            src={ProfilePicture}
                                            alt="profilePhoto"
                                            width="50%"
                                            height="50%"
                                            layout="responsive"
                                            objectFit="contain"
                                            className={style.img}
                                        />
                                    )}
                                    <div style={{ 
                                        "opacity": selectFriend.includes(friend.ethAddress) ? 1 : 0,
                                        "width":selectFriend.includes(friend.ethAddress) ? "23px" : "17px",
                                        "right":selectFriend.includes(friend.ethAddress) ? "-4px" : "10px"
                                }} className={style.includes}>
                                        <FontAwesomeIcon icon={faCheck} />
                                    </div>
                                </div>
                                <div className={style.data}>
                                    <p>{friend.username}</p>
                                    <p>{friend.userTag}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </div>
            {internetStatus === false && <OfflineNotification />}
        </div>
    )
}

export default Group