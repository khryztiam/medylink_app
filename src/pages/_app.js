// pages/_app.js
import Head from "next/head";
import { AuthProvider } from "@/context/AuthContext";
import AuthGate from "@/components/AuthGate";
import Layout from "@/components/Layout";

// Estilos globales
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <title>Medylink</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3f91e8" />
      </Head>

      <AuthGate>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthGate>
    </AuthProvider>
  );
}