import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ClientProvider } from '@micro-stacks/react';
import { useCallback } from 'react';
import { StacksMocknet } from "micro-stacks/network";
import { destroySession, saveSession } from '../common/fetchers';
 
function MyApp({ Component, pageProps }: AppProps) {
  const network = new StacksMocknet();

  return (
    <ClientProvider
      appName="Blockpost"
      appIconUrl="/vercel.png"
      network={network}
      // dehydratedState={pageProps?.dehydratedState}
      // onPersistState={useCallback(async (dehydratedState: string) => {
      //   await saveSession(dehydratedState);
      // }, [])}
      // onSignOut={useCallback(async () => {
      //   await destroySession();
      // }, [])}
    >
      <Component {...pageProps} />
    </ClientProvider>
  );
}
 
export default MyApp;
