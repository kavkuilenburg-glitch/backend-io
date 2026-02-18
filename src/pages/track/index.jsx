// /track — Landing page where customers can enter a tracking number
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function TrackIndex() {
  const [input, setInput] = useState('');
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    if (input.trim()) router.push(`/track/${input.trim()}`);
  }

  return (
    <>
      <Head>
        <title>Track Your Order — Backend.io</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: '100vh', background: '#0a0a16', fontFamily: "'DM Sans', sans-serif", color: '#e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>📦</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>Track Your Order</h1>
        <p style={{ fontSize: 15, color: '#64748b', marginBottom: 32, textAlign: 'center', maxWidth: 400 }}>
          Enter your tracking number below to see the latest status of your delivery.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 440 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter tracking number..."
            style={{ flex: 1, padding: '14px 18px', background: '#12121f', border: '1px solid #22223a', borderRadius: 12, color: '#e2e8f0', fontSize: 15, outline: 'none', fontFamily: 'inherit' }}
          />
          <button type="submit" style={{ padding: '14px 28px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Track
          </button>
        </form>
        <p style={{ fontSize: 11, color: '#4a5568', marginTop: 40 }}>Powered by <span style={{ color: '#6366f1', fontWeight: 600 }}>Backend.io</span></p>
      </div>
    </>
  );
}
