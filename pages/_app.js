import "../styles/globals.css";
import { MoralisProvider } from "react-moralis";

function MyApp({ Component, pageProps }) {
  const name = "alex";
  return (
    <MoralisProvider
      appId="tfxLuvik4gAvZVhsllf3XOgWUKzuUXNgm7Ozfpl5"
      serverUrl="https://kce1p7yqjnro.usemoralis.com:2053/server"
    >
      <Component {...pageProps} name={name} />
    </MoralisProvider>
  );
}

export default MyApp;
