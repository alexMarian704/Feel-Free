import { Moralis } from "moralis";

export async function groupUnreadMessages(groupAddress, myAddress, setGroupUnreadMessages, groupMessages) {
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
            setGroupUnreadMessages(set.size);
        }
        const query1 = new Moralis.Query(`Group${groupAddress}`)
        query1.equalTo("from", myAddress);
        const subscription = await query1.subscribe()
        subscription.on("delete", async (x) => {
            const results_ = await query.find();
            if (results_ !== undefined) {
                let set = new Set();
                results_.map((x) => {
                    set.add(x.attributes.time)
                })
                console.log(set.size)
                setGroupUnreadMessages(set.size);
            }
        })
    }
}