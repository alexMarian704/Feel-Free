import React from 'react'
import { deleteChat } from "../function/deletechat.js"

const ConfirmDelete = ({ userAddress, friendAddress, setOpenConfirm }) => {
    return (
        <div>
            <h4>Delete this chat ?</h4>
            <div>
                <button onClick={() => setOpenConfirm(false)}>No</button>
                <button onClick={()=> deleteChat(userAddress, friendAddress)} >Yes</button>
            </div>
        </div>
    )
}

export default ConfirmDelete