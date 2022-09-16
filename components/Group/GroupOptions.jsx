import React, { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import style from "../../styles/GroupChat.module.css"
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";

const GroupOptions = ({ open, setOpen, groupRef, setOpenDelete }) => {
    const router = useRouter()

    const goToMedia = ()=>{
        router.push({
            pathname:`/group/info/${groupRef}`,
            query:{
                media:"media"
            }
        })
    }

    return (
        <div className={style.containers}>
            <button className={style.options} onClick={() => setOpen(!open)} ><FontAwesomeIcon icon={faEllipsisV} /></button>
            <div className={style.optionsContainer} id={open === false ? style.close : style.open}>
                <button onClick={goToMedia}>Media</button>
                <button onClick={()=> {setOpenDelete(true) , setOpen(false)}}>Delete chat</button>
                <button>Leave</button>
            </div>
        </div>
    )
}

export default GroupOptions