import { useEffect } from 'react';
import Head from 'next/head';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const installBtn = document.getElementById('installApp');
      if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.onclick = () => {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(() => {
            installBtn.style.display = 'none';
          });
        };
      }
    });
  }, []);

  return (
    <>
  <Head>
  <link rel="manifest" href="/manifest.json" />
  <link rel="apple-touch-icon" href="/icon-192.png" />
  <meta name="theme-color" content="#000000" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
</Head>

      {/* 👇 This button will show only when install is possible */}
      <button
        id="installApp"
        style={{
          display: 'none',
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 20px',
          borderRadius: '10px',
          background: '#00bcd4',
          color: '#fff',
          fontWeight: 'bold',
          border: 'none',
          zIndex: 9999
        }}
      >
        Install App
      </button>

      <Component {...pageProps} />
    </>
  );
}
