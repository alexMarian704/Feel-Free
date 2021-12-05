import "../styles/globals.css";
import { MoralisProvider } from "react-moralis";

function MyApp({ Component, pageProps }) {
  const serverURL = process.env.NEXT_PUBLIC_SERVERURL;
  const appID = process.env.NEXT_PUBLIC_APPID;

  return (
    <MoralisProvider appId={appID} serverUrl={serverURL}>
      <div className="containerBlack">
        <Component {...pageProps} />
      </div>
    </MoralisProvider>
  );
}

export default MyApp;
