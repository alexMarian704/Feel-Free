import React, { useState, useEffect, useMemo } from 'react'
import { useInternetConnection } from "../../function/hooks/useInternetConnection";
import OfflineNotification from "../../components/OfflineNotification";
import { useRouter } from 'next/router';
import Head from "next/head";
import { useMoralis } from "react-moralis";
import Reject from "../../components/Reject";
import ConfigAccount from "../../components/ConfigAccount";
import { Moralis } from "moralis";
import style from "../../styles/Group.module.css"
import CheckPassword from "../../components/CheckPassword";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSearch, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import FriendData from '../../components/Group/FriendData';
import GroupData from '../../components/Group/GroupData';

const Group = () => {
    const [openSearch, setOpenSearch] = useState(false);
    const [selectFriend, setSelectFriend] = useState([])
    const [friendList, setFriendList] = useState(0);
    const [search, setSearch] = useState("")
    const [step, setStep] = useState(0)
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

    const filteredFriends = useMemo(() => {
        if (friendList !== 0 && friendList !== 1) {
            return friendList.filter((friend) => {
                if (friend.userTag.includes(search))
                    return true;
                else
                    return false;
            })
        } else
            return [];
    }, [search])

    useEffect(() => {
        if (isAuthenticated && user)
            getFriend();
    }, [isAuthenticated, user])

    if (isInitialized === false)
        return (
            <div>
                <div className={style.loadingContainer}>
                    <div className={style.loader}></div>
                </div>
            </div>
        )
    else if (!isAuthenticated) {
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
                    <button onClick={() => step === 0 ? router.push("/") : setStep(0)} className={style.backBut}><FontAwesomeIcon icon={faArrowLeft} /></button>
                    {openSearch === false && <h4>Create group</h4>}
                    {openSearch === true && <input type="text" placeholder='Search' value={search} onChange={(e) => setSearch(e.target.value)} />}
                </div>
                {step === 0 && <button className={style.search} onClick={() => {
                    setOpenSearch(!openSearch)
                    setSearch("")
                }}
                ><FontAwesomeIcon icon={faSearch} /></button>}
            </div>
            {step === 0 && <div>
                {friendList !== 0 && friendList !== 1 &&
                    <div>
                        {search === "" && friendList.map((friend) => (
                            <FriendData friend={friend} style={style} select={select} selectFriend={selectFriend} key={friend.userTag} />
                        ))}
                        {search !== "" && filteredFriends.length > 0 && filteredFriends.map((friend) => (
                            <FriendData friend={friend} style={style} select={select} selectFriend={selectFriend} key={friend.userTag} />
                        ))}
                        {search !== "" && filteredFriends.length === 0 &&
                            <div>
                                <div className={style.noResults}>
                                    <FontAwesomeIcon icon={faSearch} />
                                    <p>No results!</p>
                                </div>
                            </div>}
                    </div>
                }
            </div>}
            {step === 1 && <GroupData selectFriend={selectFriend} />}
            {step === 0 && <button className={style.next} onClick={() => {
                if (selectFriend.length > 0) {
                    setStep(1)
                    setOpenSearch(false)
                }
            }
            }>
                <FontAwesomeIcon icon={faArrowRight} />
            </button>}
            {internetStatus === false && <OfflineNotification />}
        </div>
    )
}

export default Group