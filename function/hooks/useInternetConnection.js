import { useState, useEffect } from 'react';

export const useInternetConnection = () => {
    const [internet, setInternet] = useState(true);

    useEffect(() => {
        window.addEventListener("online", () => {
                setInternet(true);
        })

        window.addEventListener("offline", () => {
                setInternet(false);
        })

        return () => {
            window.removeEventListener("online", () => {
                    setInternet(true);
            })

            window.removeEventListener("offline", () => {
                    setInternet(false);
            })
        }

    }, [])

    return internet;

}