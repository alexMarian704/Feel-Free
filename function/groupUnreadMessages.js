import { Moralis } from "moralis";

export async function groupUnreadMessages(groupAddress, myAddress, setGroupUnreadMessages, groupMessages, groupRef, decrypt) {
    if (groupAddress && myAddress) {
        const unread = Moralis.Object.extend(`Group${groupAddress}`);
        const query = new Moralis.Query(unread);
        query.greaterThan("membersNumber", 1);
        const results = await query.find();
        if (results !== undefined) {
            let set = new Set();
            results.map((x) => {
                set.add(x.attributes.time)
            })
            if (JSON.parse(localStorage.getItem(`Group${groupRef}Messages`) !== null)) {
                const encryptedMessages = localStorage.getItem(`Group${groupRef}Messages`)
                const decryptedMessages = decrypt(encryptedMessages, Moralis.User.current().id);

                if (set.size > decryptedMessages.messages.length)
                    setGroupUnreadMessages(decryptedMessages.messages.length);
                else
                    setGroupUnreadMessages(set.size);
            } else {
                setGroupUnreadMessages(set.size);
            }
        }
        const subscription = await query.subscribe()
        subscription.on("delete", async (x) => {
            const results_ = await query.find();
            if (results_ !== undefined) {
                let set = new Set();
                results_.map((x) => {
                    set.add(x.attributes.time)
                })

                if (JSON.parse(localStorage.getItem(`Group${groupRef}Messages`) !== null)) {
                    const encryptedMessages = localStorage.getItem(`Group${groupRef}Messages`)
                    const decryptedMessages = decrypt(encryptedMessages, Moralis.User.current().id);

                    if (set.size > decryptedMessages.messages.length)
                        setGroupUnreadMessages(decryptedMessages.messages.length);
                    else
                        setGroupUnreadMessages(set.size);
                } else {
                    setGroupUnreadMessages(set.size);
                }
            }
        })
    }
}