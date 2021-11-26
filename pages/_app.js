import "../styles/globals.css";
import { MoralisProvider } from "react-moralis";

function MyApp({ Component, pageProps }) {
  const serverURL = process.env.NEXT_PUBLIC_SERVERURL;
  const appID = process.env.NEXT_PUBLIC_APPID;
  return (
    <MoralisProvider
      appId={appID}
      serverUrl={serverURL}
    >
      <Component {...pageProps} />
    </MoralisProvider>
  );
}

export default MyApp;
