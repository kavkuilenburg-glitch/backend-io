// ============================================
// PUBLIC TRACKING PAGE
// ============================================
// This is the page customers see at:
// https://yourdomain.com/track/NL4829104821
//
// It fetches order data from our API and renders
// the tracking page using the store's custom config
// from the Tracking Page Customizer.
// ============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Status mapping for the timeline
const STATUS_ORDER = ['ordered', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];
const STATUS_LABELS = {
  ordered: 'Ordered',
  unfulfilled: 'Ordered',
  shipped: 'Shipped',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  at_post_office: 'At Post Office',
  delivered: 'Delivered',
};

function getStatusStep(status) {
  const map = { unfulfilled: 0, ordered: 0, shipped: 1, in_transit: 2, at_post_office: 3, out_for_delivery: 3, delivered: 4 };
  return map[status] ?? 0;
}

// ---- Section Renderers ----
// Each function renders one section type from the customizer config

function AnnouncementBar({ settings, blocks, theme }) {
  const bg = settings?.bg_color || theme.primary;
  const color = settings?.text_color || '#ffffff';
  return (
    <div style={{ background: bg, color, textAlign: 'center', padding: `${settings?.padding_y || 10}px 20px`, fontSize: settings?.font_size || 13, fontWeight: 500 }}>
      {blocks?.[0]?.settings?.text || 'Welcome!'}
    </div>
  );
}

function HeroBanner({ settings, theme, data }) {
  const heading = (settings?.heading || 'Your order is on its way!').replace('{{order_number}}', data.orderNumber);
  const sub = (settings?.subheading || 'Order {{order_number}}')
    .replace('{{order_number}}', data.orderNumber)
    .replace('{{est_date}}', data.estimatedDelivery ? new Date(data.estimatedDelivery).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : 'Soon');

  const bgStyle = settings?.bg_type === 'solid'
    ? { background: settings?.bg_color_1 || theme.primary }
    : { background: `linear-gradient(135deg, ${settings?.bg_color_1 || theme.primary}, ${settings?.bg_color_2 || '#8b5cf6'})` };

  return (
    <div style={{ ...bgStyle, padding: `${settings?.padding_y || 40}px 24px`, borderRadius: settings?.border_radius || 12, textAlign: settings?.text_align || 'center', margin: '20px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 32, marginBottom: 8, animation: 'truckDrive 2s ease-in-out infinite' }}>🚚</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: settings?.text_color || '#fff', margin: 0 }}>{heading}</h1>
        {settings?.show_order_info !== false && (
          <p style={{ fontSize: 14, color: `${settings?.text_color || '#fff'}cc`, marginTop: 8 }}>{sub}</p>
        )}
      </div>
    </div>
  );
}

function TrackingTimeline({ settings, theme, data }) {
  const steps = ['Ordered', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'];
  const currentStep = getStatusStep(data.status);
  const isVertical = settings?.style === 'vertical';
  const activeColor = settings?.active_color || theme.accent || '#34d399';
  const inactiveColor = settings?.inactive_color || '#22223a';

  if (isVertical) {
    return (
      <div style={{ padding: `${settings?.padding_y || 24}px`, background: settings?.bg_color || 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', position: 'relative' }}>
            {i < steps.length - 1 && (
              <div style={{ position: 'absolute', left: 15, top: 32, width: settings?.connector_thickness || 2, height: 'calc(100% - 16px)', background: i < currentStep ? activeColor : inactiveColor }} />
            )}
            <div style={{ width: 32, height: 32, borderRadius: 16, background: i <= currentStep ? activeColor : inactiveColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, fontSize: 14 }}>
              {i <= currentStep ? '✓' : ''}
            </div>
            <div style={{ paddingBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: i <= currentStep ? '#e2e8f0' : '#4a5568' }}>{step}</div>
              {settings?.show_dates !== false && (
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  {i <= currentStep ? (data.events?.[steps.length - 1 - i]?.timestamp ? new Date(data.events[steps.length - 1 - i].timestamp).toLocaleDateString() : '') : ''}
                </div>
              )}
              {i === currentStep && data.events?.[0] && (
                <div style={{ fontSize: 12, color: '#a8b2d1', marginTop: 4 }}>{data.events[0].description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: `${settings?.padding_y || 24}px`, background: settings?.bg_color || 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {steps.map((step, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div style={{ width: 28, height: 28, borderRadius: 14, background: i <= currentStep ? activeColor : inactiveColor, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, fontSize: 12, color: '#fff', fontWeight: 700 }}>
              {settings?.show_icon !== false && i <= currentStep ? '✓' : i + 1}
            </div>
            <div style={{ fontSize: 10, color: i <= currentStep ? activeColor : '#4a5568', marginTop: 6, fontWeight: 600, textAlign: 'center' }}>{step}</div>
            {i < steps.length - 1 && (
              <div style={{ position: 'absolute', top: 14, left: '50%', width: '100%', height: settings?.connector_thickness || 2, background: i < currentStep ? activeColor : inactiveColor, zIndex: 0 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderDetails({ settings, data }) {
  return (
    <div style={{ padding: '20px 24px', background: settings?.bg_color || 'rgba(255,255,255,0.03)', borderRadius: settings?.border_radius || 12 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#e2e8f0' }}>{settings?.heading || 'Order Summary'}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {settings?.show_image !== false && <div style={{ width: 48, height: 48, background: '#1a1a2e', borderRadius: 8 }} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 500 }}>{data.product}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Order {data.orderNumber}</div>
        </div>
        {settings?.show_price !== false && <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>€{data.amount || ''}</div>}
      </div>
      {data.trackingNumber && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>Tracking Number</span>
          <span style={{ fontSize: 13, color: '#a8b2d1', fontFamily: 'monospace' }}>{data.trackingNumber}</span>
        </div>
      )}
    </div>
  );
}

function ProductRecommendations({ settings, theme }) {
  const cols = settings?.columns || 3;
  return (
    <div style={{ padding: '20px 24px', background: settings?.bg_color || 'rgba(255,255,255,0.03)', borderRadius: settings?.border_radius || 12 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#e2e8f0' }}>{settings?.heading || 'You might also like'}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} style={{ padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ width: '100%', aspectRatio: '1', background: '#1a1a2e', borderRadius: 8, marginBottom: 8 }} />
            <div style={{ fontSize: 12, color: '#a8b2d1' }}>Product {i + 1}</div>
            {settings?.show_price !== false && <div style={{ fontSize: 13, color: theme.primary, fontWeight: 700, marginTop: 2 }}>€29.99</div>}
            {settings?.show_button !== false && (
              <button style={{ marginTop: 8, width: '100%', padding: '8px 0', borderRadius: 8, border: 'none', background: theme.primary, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Add to Cart</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SupportContact({ settings, theme }) {
  return (
    <div style={{ padding: '20px 24px', background: settings?.bg_color || 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>{settings?.heading || 'Need help?'}</h3>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>{settings?.subtext || 'We\'re here for you'}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#a8b2d1', padding: '8px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>📧 {settings?.email || 'support@store.com'}</span>
        {settings?.show_chat !== false && <span style={{ fontSize: 12, color: theme.primary, padding: '8px 14px', background: `${theme.primary}15`, borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>💬 Live Chat</span>}
      </div>
    </div>
  );
}

function RichText({ settings, blocks }) {
  return (
    <div style={{ padding: `${settings?.padding_y || 20}px 24px`, textAlign: settings?.text_align || 'left' }}>
      {blocks?.map((block, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          {block.type === 'heading' && <h3 style={{ fontSize: block.settings?.size === 'h2' ? 22 : 16, fontWeight: 700, color: '#e2e8f0' }}>{block.settings?.text}</h3>}
          {block.type === 'text' && <p style={{ fontSize: 14, color: '#a8b2d1', lineHeight: 1.7 }}>{block.settings?.text}</p>}
          {block.type === 'button' && <a href={block.settings?.link || '#'} style={{ display: 'inline-block', marginTop: 4, padding: '10px 24px', borderRadius: 8, background: block.settings?.style === 'outline' ? 'transparent' : '#6366f1', border: block.settings?.style === 'outline' ? '1px solid #6366f1' : 'none', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>{block.settings?.text || 'Button'}</a>}
        </div>
      ))}
    </div>
  );
}

function Divider({ settings }) {
  if (settings?.style === 'space') return <div style={{ height: settings?.spacing || 20 }} />;
  return (
    <div style={{ padding: `${settings?.spacing || 20}px 0`, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: `${settings?.width || 100}%`, height: 0, borderTop: `${settings?.thickness || 1}px ${settings?.style || 'solid'} ${settings?.color || '#22223a'}` }} />
    </div>
  );
}

// Section renderer map
const SECTION_RENDERERS = {
  announcement_bar: AnnouncementBar,
  hero_banner: HeroBanner,
  tracking_timeline: TrackingTimeline,
  order_details: OrderDetails,
  product_recommendations: ProductRecommendations,
  support_contact: SupportContact,
  rich_text: RichText,
  divider: Divider,
  // Add more as needed
};

// ---- MAIN TRACKING PAGE ----
export default function TrackingPage() {
  const router = useRouter();
  const { trackingNumber } = router.query;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    if (!trackingNumber) return;
    fetchTracking(trackingNumber);
  }, [trackingNumber]);

  async function fetchTracking(num) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tracking/${num}`);
      if (!res.ok) throw new Error('Tracking number not found');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  function handleLookup(e) {
    e.preventDefault();
    if (manualInput.trim()) {
      router.push(`/track/${manualInput.trim()}`);
    }
  }

  const theme = data?.page?.theme || { primary: '#6366f1', accent: '#34d399', bg: '#0a0a16', text: '#e2e8f0' };

  return (
    <>
      <Head>
        <title>{data ? `Track Order ${data.orderNumber}` : 'Track Your Order'} — {data?.page?.storeName || 'Backend.io'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        {data?.page?.customCss && <style>{data.page.customCss}</style>}
      </Head>

      <div style={{ minHeight: '100vh', background: theme.bg || '#0a0a16', fontFamily: "'DM Sans', sans-serif", color: theme.text || '#e2e8f0' }}>
        {/* Store Header */}
        <header style={{ maxWidth: 680, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.primary}15` }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: theme.primary }}>{data?.page?.storeName || 'Track'}</span>
          <nav style={{ display: 'flex', gap: 20 }}>
            <a href="#" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>Shop</a>
            <a href="#" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>Help</a>
          </nav>
        </header>

        <main style={{ maxWidth: 680, margin: '0 auto', padding: '0 20px 60px' }}>
          {/* Loading state */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ width: 40, height: 40, border: '3px solid #22223a', borderTopColor: theme.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: '#64748b', fontSize: 14 }}>Loading tracking info...</p>
            </div>
          )}

          {/* Error / Not found — show lookup form */}
          {error && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Track Your Order</h2>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Enter your tracking number to see the latest status</p>
              <form onSubmit={handleLookup} style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}>
                <input
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  placeholder="e.g. NL4829104821"
                  style={{ flex: 1, padding: '12px 16px', background: '#12121f', border: '1px solid #22223a', borderRadius: 10, color: '#e2e8f0', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                />
                <button type="submit" style={{ padding: '12px 24px', background: theme.primary, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Track</button>
              </form>
              {trackingNumber && <p style={{ color: '#f87171', fontSize: 13, marginTop: 12 }}>Tracking number "{trackingNumber}" not found. Please check and try again.</p>}
            </div>
          )}

          {/* Tracking data loaded — render sections */}
          {data && !loading && (
            <div>
              {data.page?.sections?.filter(s => s.enabled !== false).map((section, i) => {
                const Renderer = SECTION_RENDERERS[section.type];
                if (!Renderer) return null;
                return (
                  <div key={section.id || i} style={{ animation: `fadeUp 0.5s ease-out ${i * 0.08}s forwards`, opacity: 0 }}>
                    <Renderer settings={section.settings} blocks={section.blocks} theme={theme} data={data} />
                  </div>
                );
              })}

              {/* Fallback: if no sections configured, show default layout */}
              {(!data.page?.sections || data.page.sections.length === 0) && (
                <>
                  <HeroBanner settings={{}} theme={theme} data={data} />
                  <div style={{ height: 16 }} />
                  <TrackingTimeline settings={{}} theme={theme} data={data} />
                  <div style={{ height: 16 }} />
                  <OrderDetails settings={{}} data={data} />
                  <div style={{ height: 16 }} />
                  <SupportContact settings={{}} theme={theme} />
                </>
              )}

              {/* Tracking event log */}
              {data.events?.length > 0 && (
                <div style={{ marginTop: 24, padding: '20px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#e2e8f0' }}>Tracking History</h3>
                  {data.events.map((event, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < data.events.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: i === 0 ? (theme.accent || '#34d399') : '#22223a', marginTop: 6, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{event.description}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          {new Date(event.timestamp).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          {event.location && ` • ${event.location}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={{ maxWidth: 680, margin: '0 auto', padding: '20px', borderTop: '1px solid #22223a', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#4a5568' }}>Powered by <span style={{ color: theme.primary, fontWeight: 600 }}>Backend.io</span></p>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes truckDrive { 0% { transform: translateX(-6px); } 50% { transform: translateX(6px); } 100% { transform: translateX(-6px); } }
      `}</style>
    </>
  );
}
