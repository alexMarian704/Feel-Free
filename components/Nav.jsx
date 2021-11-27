import React from "react";
import Link from "next/link";
import { useRouter } from "next/router"
import { useMoralis } from "react-moralis";

export default function Nav() {
  const { isAuthenticated, logout } = useMoralis();
  const router = useRouter()

  const logOutUser = () => {
    logout();
    router.push("/");
  };

  return (
    <nav>
      <div id="nav-container">
        <Link href="/"><h1>Feel Free</h1></Link>
        <Link href="/transfer"><h2>Transfer</h2></Link>
        <Link href="/search"><h2>Search</h2></Link>
      </div>
      <div>
        <button onClick={logOutUser}>Log out</button>
      </div>
    </nav>
  );
}
