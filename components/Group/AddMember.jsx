import React , { useState , useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Moralis } from "moralis";
import { useMoralis } from "react-moralis";

const AddMember = ({setAddMember, group, members, style }) => {
    const { user } = useMoralis();
    const [friendList , setFriendList] = useState([])

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
            console.log(array)
            setFriendList(array.filter((x)=> members.includes(x) === true));
        }
    }

    useEffect(()=>{
        getFriend()
    },[])

    console.log(friendList)

    return (
        <div className={style.addMemberContainer}>
            <div className={style.nav}>
                <div className={style.groupInfo}>
                    <button onClick={() => setAddMember(false)} className={style.backBut}><FontAwesomeIcon icon={faArrowLeft} /></button>
                </div>
            </div>
            <div>
                {friendList.length > 0 && 
                <div>
                    {friendList.map((friend , i)=>{
                        if(members.includes(friend.ethAddress) === false){
                            return(
                                <div>
                                    <h1>{friend.name}</h1>
                                </div>
                            )
                        }
                    })}
                </div>}
            </div>
        </div>
    )
}

export default AddMember