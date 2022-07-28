import React, { useState } from 'react';
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import Image from "next/image";
import style from "../styles/FriendList.module.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProfilePicture from "../public/profile.jpg";
import { useRouter } from "next/router";
import { faComment } from "@fortawesome/free-solid-svg-icons";

export default function FriendList() {
    const { user } = useMoralis();
    const [loading, setLoading] = useState(true)
    const [friendList, setFriendList] = useState(0);
    const route = useRouter()

    if (friendList === 0) {
        const getFriend = async () => {
            const UserFriends = Moralis.Object.extend("Friends");
            const query = new Moralis.Query(UserFriends);
            query.equalTo("ethAddress", user.get("ethAddress"));
            const result = await query.first();
            //console.log(result);
            if (result._objCount % 2 == 1) {
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
                    setLoading(false);
                }
                else {
                    setFriendList(1);
                    setLoading(false);
                }
            }
        }
        getFriend();
    }

    const goToProfile = (address) => {
        route.push(`/users/${address}`)
    }

    const goToChat = (address) => {
        route.push(`/messages/${address}`)
    }

    return (
        <div>
            {friendList !== 0 && friendList !== 1 && loading == false &&
                <div>
                    {friendList.map((friend, i) => (
                        <div key={i} className={style.friendContainer}>
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
                                        onClick={() => goToProfile(friend.ethAddress)} />
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
                                        onClick={() => goToProfile(friend.ethAddress)} />
                                )}
                            </div>
                            <div className={style.friendData}>
                                <p onClick={() => goToProfile(friend.ethAddress)}>{friend.username}</p>
                                <p onClick={() => goToProfile(friend.ethAddress)}>@{friend.userTag}</p>
                            </div>
                            <div className={style.buttonContainer}>
                                <button onClick={() => goToChat(friend.ethAddress)}><FontAwesomeIcon icon={faComment} /> </button>
                            </div>
                        </div>
                    )
                    )}
                </div>
            }
            {friendList === 0 && loading === true &&
                <div className={style.loadingContainer}>
                    <div className={style.loader}></div>
                </div>
            }
        </div>
    )
}