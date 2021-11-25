import "../styles/globals.css";
import { MoralisProvider } from "react-moralis";

function MyApp({ Component, pageProps }) {
  const name = "alex";
  return (
    <MoralisProvider
      appId=""
      serverUrl=""
    >
      <Component {...pageProps} name={name} />
    </MoralisProvider>
  );
}

export default MyApp;
