// POST /api/store/connect — Connect a Shopify store
import { prisma } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { shopifyUrl, accessToken, name, email } = req.body;

  if (!shopifyUrl || !accessToken) {
    return res.status(400).json({ error: 'shopifyUrl and accessToken are required' });
  }

  try {
    // Test the connection by making a simple Shopify API call
    const testUrl = `https://${shopifyUrl}/admin/api/2026-01/shop.json`;
    const testRes = await fetch(testUrl, {
      headers: { 'X-Shopify-Access-Token': accessToken },
    });

    if (!testRes.ok) {
      return res.status(400).json({ error: 'Invalid Shopify credentials. Check your store URL and access token.' });
    }

    const shopData = await testRes.json();

    const store = await prisma.store.upsert({
      where: { shopifyUrl },
      update: { accessToken, name: name || shopData.shop?.name || '', email: email || shopData.shop?.email || '' },
      create: { shopifyUrl, accessToken, name: name || shopData.shop?.name || '', email: email || shopData.shop?.email || '' },
    });

    // Create default email flows
    const defaultFlows = [
      { trigger: 'order_confirmed', delay: 'immediately', subject: 'Order confirmed! 🎉', template: 'order_confirmation', sortOrder: 1 },
      { trigger: 'shipped', delay: 'immediately', subject: 'Your order is on its way! 📦', template: 'shipped_notification', sortOrder: 2 },
      { trigger: 'in_transit', delay: 'every_24h', subject: 'Shipping update for your order', template: 'transit_update', sortOrder: 3 },
      { trigger: 'out_for_delivery', delay: 'immediately', subject: 'Your package is out for delivery! 🚚', template: 'out_for_delivery', sortOrder: 4 },
      { trigger: 'delivered', delay: 'immediately', subject: 'Your order has been delivered! ✅', template: 'delivered', sortOrder: 5 },
      { trigger: 'at_post_office', delay: 'immediately', subject: 'Your package is ready for pickup!', template: 'pickup_ready', sortOrder: 6 },
      { trigger: 'no_pickup_reminder', delay: '48h', subject: 'Reminder: Your package is waiting', template: 'pickup_reminder', sortOrder: 7 },
      { trigger: 'review_request', delay: '3d', subject: 'How was your order?', template: 'review_request', enabled: false, sortOrder: 8 },
    ];

    for (const flow of defaultFlows) {
      await prisma.emailFlow.upsert({
        where: { id: `${store.id}-${flow.trigger}` }, // won't match, so creates
        update: {},
        create: { ...flow, storeId: store.id },
      }).catch(() => {
        // If unique constraint fails, create with generated ID
        return prisma.emailFlow.create({ data: { ...flow, storeId: store.id } });
      });
    }

    // Create default tracking config
    await prisma.trackingConfig.upsert({
      where: { storeId: store.id },
      update: {},
      create: {
        storeId: store.id,
        theme: { primary: '#6366f1', accent: '#34d399', bg: '#0a0a16', text: '#e2e8f0', storeName: store.name },
        sections: [],
      },
    });

    return res.json({ success: true, store: { id: store.id, name: store.name, shopifyUrl: store.shopifyUrl } });
  } catch (error) {
    console.error('Store connect error:', error);
    return res.status(500).json({ error: error.message });
  }
}
