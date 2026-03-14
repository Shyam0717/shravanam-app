import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Layout } from '@/components/Layout';
import { AudioProvider } from '@/contexts/AudioContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AudioProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AudioProvider>
  );
}
