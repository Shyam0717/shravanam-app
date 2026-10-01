import '@/styles/globals.css';
import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Layout } from '@/components/Layout';
import { AudioProvider } from '@/contexts/AudioContext';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Only in production: a service worker caching dev-server output would serve stale code during development.
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  }, []);

  return (
    <AudioProvider>
      <Head>
        {/* viewport-fit=cover lets the player sit above the iPhone home indicator via safe-area insets */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>Shravanam</title>
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AudioProvider>
  );
}
