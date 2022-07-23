import { useState, useEffect } from 'react';
import { Moralis } from "moralis";

export const useOnlineFriend = (address) => {
    const [online, setOnline] = useState(false);
    const [time, setTime] = useState("");

    useEffect(async () => {
        if (address) {
            const query = new Moralis.Query("Tags")
            query.equalTo("ethAddress", address);
            const subscription = await query.subscribe()
            const result = await query.first();

            setOnline(result.attributes.active);
            setTime(result.attributes.timeActive)

            subscription.on("update", (obj) => {
                setOnline(obj.attributes.active);
                setTime(obj.attributes.timeActive)
            })
        }
    }, [address])

    return { online, time }
}