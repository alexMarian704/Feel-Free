import React from "react";
import Head from "next/head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle} from "@fortawesome/free-solid-svg-icons";

const UnsupportedChain = () => {
    return (
        <div className="unsupported">
            <Head>
                <title>Change Chain</title>
            </Head>
            <h1><FontAwesomeIcon icon={faExclamationCircle} /></h1>
            <h2 className="setUpTitle">You are using an unsupported chain</h2>
            <h2 className="setUpTitle">Please change your chain to ETH BNB or POLYGON</h2>
        </div>
    )
}

export default UnsupportedChain