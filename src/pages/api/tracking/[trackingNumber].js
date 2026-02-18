// /api/tracking/[trackingNumber] — PUBLIC endpoint
// Returns order info + tracking events + page config for the customer-facing tracking page
import { prisma } from '../../../lib/db';

export default async function handler(req, res) {
  const { trackingNumber } = req.query;

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Find the order by tracking number
  const order = await prisma.order.findFirst({
    where: { trackingNumber },
    include: {
      trackingEvents: { orderBy: { timestamp: 'desc' } },
      store: {
        include: { trackingConfig: true },
      },
    },
  });

  if (!order) {
    return res.status(404).json({ error: 'Tracking number not found' });
  }

  // Build the public response (don't expose sensitive data)
  const response = {
    orderNumber: order.orderNumber,
    customerName: order.customerName.split(' ')[0], // first name only
    product: order.product,
    status: order.status,
    carrier: order.carrier,
    trackingNumber: order.trackingNumber,
    estimatedDelivery: getEstimatedDelivery(order),
    events: order.trackingEvents.map(e => ({
      status: e.status,
      description: e.description,
      location: e.location,
      timestamp: e.timestamp,
    })),
    // Page config from the customizer
    page: {
theme: typeof order.store.trackingConfig?.theme === 'string' ? JSON.parse(order.store.trackingConfig.theme) : (order.store.trackingConfig?.theme || {}),
sections: typeof order.store.trackingConfig?.sections === 'string' ? JSON.parse(order.store.trackingConfig.sections) : (order.store.trackingConfig?.sections || []),
      customCss: order.store.trackingConfig?.customCss || '',
      storeName: order.store.name,
    },
  };

  return res.json(response);
}

function getEstimatedDelivery(order) {
  if (order.status === 'delivered') return null;
  // Simple estimate: 3-5 days from last tracking event or ship date
  const lastEvent = order.lastTrackDate || order.date;
  const est = new Date(lastEvent);
  est.setDate(est.getDate() + 3);
  return est.toISOString();
}
