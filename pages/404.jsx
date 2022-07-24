import React from 'react'
import Link from "next/link";
import Head from 'next/head';

const NotFound = () => {
    return (
        <div className="container" style={{
            "paddingTop":"100px"
        }}>
            <Head>404</Head>
            <h1 style={{
                "fontSize":"calc(49px + 1vw)",
                "color":"#800040",
                "width":"100vw",
                "textAlign":"center"
            }}>404</h1>
            <h1 style={{
                "width":"100vw",
                "textAlign":"center"
            }}>Page not found</h1>
            <Link href="/">
                <h1 style={{
                "width":"320px",
                "textAlign":"center",
                "cursor":"pointer",
                "borderBottom":"2px solid #800040",
                "margin":"auto",
                "marginTop":"60px",
            }}>Back to home page</h1>
            </Link>
        </div>
    )
}

export default NotFound