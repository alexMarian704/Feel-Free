import React, { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import style from "../../styles/GroupChat.module.css"
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

const GroupOptions = ({setAddMember , open, setOpen}) => {

    return (
        <div className={style.containers}>
            <button className={style.options} onClick={() => setOpen(!open)} ><FontAwesomeIcon icon={faEllipsisV} /></button>
            <div className={style.optionsContainer} id={open === false ? style.close : style.open}>
                <button onClick={()=> console.log("1")}>Media</button>
                <button>Delete chat</button>
                <button onClick={()=> {setAddMember(true) , setOpen(false)}}>Add members</button>
                <button>Leave</button>
            </div>
        </div>
    )
}

export default GroupOptions