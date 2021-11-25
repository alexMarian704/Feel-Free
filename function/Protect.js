import { useMoralis } from "react-moralis";
import Router from 'next/router'

export const checkAuthUser = () => {
    const { isAuthenticated } = useMoralis();


        if (!isAuthenticated) {
            Router.push("/signin")
        }
    
}