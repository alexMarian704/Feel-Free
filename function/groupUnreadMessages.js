import { Moralis } from "moralis";

export async function groupUnreadMessages(groupAddress, myAddress, setGroupUnreadMessages, groupMessages) {
    if (groupAddress && myAddress) {
        const unread = Moralis.Object.extend(`Group${groupAddress}`);
        const query = new Moralis.Query(unread);
        query.equalTo("from", myAddress);
        const results = await query.find();
        if (results !== undefined) {
            setGroupUnreadMessages(results.length);
        }
        const query1 = new Moralis.Query(`Group${groupAddress}`)
        query1.equalTo("from", myAddress);
        const subscription = await query1.subscribe()
        subscription.on("delete", async (x) => {
            const results_ = await query.find();
            if (results_ !== undefined) {
                setGroupUnreadMessages(results_.length);
            }
        })
    }
}