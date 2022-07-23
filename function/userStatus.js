import { Moralis } from "moralis";

export const userStatus = async () => {
    if (Moralis.User.current()) {
        const addressToTag = Moralis.Object.extend("Tags");
        const query = new Moralis.Query(addressToTag);
        query.equalTo("ethAddress", Moralis.User.current().get("ethAddress"));
        const result = await query.first();

        const d = new Date();
        let time = d.getTime();
        result.set({
            timeActive: time,
        })
        result.save();
    }
}