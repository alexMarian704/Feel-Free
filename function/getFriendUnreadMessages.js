import { Moralis } from "moralis";

export async function getFriendUnreadMessages(friendAddress, myAddress , setFriendUnreadMessages) {
    if (friendAddress && myAddress) {
        let ref;
        if (friendAddress.localeCompare(myAddress) === 1) {
            ref = `a${friendAddress.slice(2)}${myAddress.slice(2)}`
        } else {
            ref = `a${myAddress.slice(2)}${friendAddress.slice(2)}`
        }
        const unread = Moralis.Object.extend(ref);
        const query = new Moralis.Query(unread);
        query.equalTo("from", myAddress);
        const results = await query.find();
        if (results !== undefined) {
            setFriendUnreadMessages(results.length);
        }
        const query1 = new Moralis.Query(ref)
        query1.equalTo("from", myAddress);
        const subscription = await query1.subscribe()
        subscription.on("delete" , async (x)=>{
            setFriendUnreadMessages(0);
        })
    }
}