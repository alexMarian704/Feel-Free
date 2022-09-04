import React , { useState , useEffect } from 'react'
import style from "../../styles/GroupChat.module.css"

const MembersAndMedia = ({ members }) => {
    const [nav , setNav] = useState("members")

    return (
        <div>
            <div className={style.groupInfoNav}>
                <div onClick={()=> setNav("members")} style={{
                    color:nav==="members" ? "#800040" : "white",
                    borderBottom:nav==="members" ? "5px solid #800040" : "none"
                }}>
                    <h4>Members</h4>
                </div>
                <div onClick={()=> setNav("media")} style={{
                    color:nav==="media" ? "#800040" : "white",
                    borderBottom:nav==="media" ? "5px solid #800040" : "none"
                }}>
                    <h4>Media</h4>
                </div>
            </div>
        </div>
    )
}

export default MembersAndMedia