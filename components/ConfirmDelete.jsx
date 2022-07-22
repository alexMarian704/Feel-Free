import React from 'react'
import { deleteChat } from "../function/deletechat.js"
import style from "../styles/Messages.module.css"
import { useRouter } from 'next/router';

const ConfirmDelete = ({ userAddress, friendAddress, setOpenConfirm }) => {
    const router = useRouter()
    return (
        <div className={style.deleteModule} >
            <div className={style.deleteContent}>
                <h4>Delete this chat ?</h4>
                <div>
                    <button className={style.noButton} onClick={() => setOpenConfirm(false)}>No</button>
                    <button className={style.yesButton} onClick={() => deleteChat(userAddress, friendAddress , router)}>Yes</button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDelete