import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMoralis } from "react-moralis";
import useWindowDimensions from "../function/width";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faBars } from "@fortawesome/free-solid-svg-icons";

export default function Nav() {
  const { isAuthenticated, logout } = useMoralis();
  const [navIn, setNavIn] = useState("in");
  const router = useRouter();

  const logOutUser = () => {
    logout();
    router.push("/");
  };

  const { width } = useWindowDimensions();

  const changeNav = () => {
    document.getElementById("nav").className = "nav-in";
    setNavIn("in");
  };

  const changeNavOut = () => {
    document.getElementById("nav").className = "nav-out";
    setNavIn("out");
  };

  return (
    <nav className="nav-in" id="nav">
      {width < 621 && navIn === "out" && (
        <button className="close-nav" onClick={changeNav}>
          <FontAwesomeIcon icon={faTimes} color="#800040" />
        </button>
      )}

      {width < 621 && navIn === "in" && (
        <button className="open-nav" onClick={changeNavOut}>
          <FontAwesomeIcon icon={faBars} color="#800040" />
        </button>
      )}

      <div id="nav-container">
        <Link href="/">
          <h1>Feel Free</h1>
        </Link>
        <Link href="/transfer">
          <h2>Transfer</h2>
        </Link>
        <Link href="/search">
          <h2>Search</h2>
        </Link>
        <Link href="/swap">
          <h2>Swap</h2>
        </Link>
        <Link href="/profile">
          <h2>Profile</h2>
        </Link>
      </div>
      <div>
        <button onClick={logOutUser}>Log out</button>
      </div>
    </nav>
  );
}
