import React, { useState } from 'react';
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import Image from "next/image";
import style from "../styles/FriendList.module.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function FriendList() {
    const { user } = useMoralis();
    const [loading, setLoading] = useState(true)
    const [friendList, setFriendList] = useState(0);

    if (friendList === 0) {
        const getFriend = async () => {
            const UserFriends = Moralis.Object.extend("Friends");
            const query = new Moralis.Query(UserFriends);
            query.equalTo("ethAddress", user.get("ethAddress"));
            const result = await query.first();
            //console.log(result);
            if (result._objCount % 3 == 1) {
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

    console.log(friendList);

    return (
        <div>
            {friendList !== 0 && friendList !== 1 && loading == false &&
                <div>
                    {friendList.map((friend, i) => (
                        <div key={i}>
                            <p>@{friend.userTag}</p>
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