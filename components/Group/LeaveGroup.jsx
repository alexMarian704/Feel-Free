import React from 'react'
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import { useRouter } from "next/router";

const LeaveGroup = ({ style, styleChat, setLeaveGroup, groupRef }) => {
    const { user } = useMoralis();
    const router = useRouter()

    const leave = async () => {
        const Group = Moralis.Object.extend(`Group${groupRef}`);
        const query = new Moralis.Query(Group);
        query.equalTo("type", "data");
        const results = await query.first();
        let members = results.attributes.members.filter((x) => x !== user.get("ethAddress"))
        let owner;
        if (results.attributes.owner === user.get("ethAddress")) {
            owner = members[0];
        } else {
            owner = results.attributes.owner;
        }
        let colors = results.attributes.colors
        for (let i = 0; i < colors.length; i++) {
            if (colors[i] === user.get("userTag")) {
                colors.splice(i, 1);
                colors.splice(i, 1);
            }
        }
        results.set({
            members: members,
            owner: owner,
            colors: colors
        })
        localStorage.removeItem(`Group${groupRef}Messages`);
        localStorage.removeItem(`Group${groupRef}Key`);
        let order = JSON.parse(localStorage.getItem(`${user.get("ethAddress")}Order`));
        let filterOrder= order.filter(x => x.groupRef !== groupRef)
        localStorage.setItem(`${user.get("ethAddress")}Order`, JSON.stringify(filterOrder));
        results.save();
        router.push("/");
    }

    return (
        <div className={style.confirmDelete} >
            <div className={styleChat.deleteContent}>
                <h4>Are you sure you want to leave ?</h4>
                <div>
                    <button className={styleChat.noButton} onClick={() => setLeaveGroup(false)}>No</button>
                    <button className={styleChat.yesButton} onClick={leave}>Yes</button>
                </div>
            </div>
        </div>
    )
}

export default LeaveGroup