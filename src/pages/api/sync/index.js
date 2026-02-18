// POST /api/sync — Sync orders and products from Shopify
import { syncOrders, syncProducts } from '../../../lib/shopify';
import { checkAddresses, autoSendAddressEmails } from '../../../lib/address';
import { updateSalesVelocity } from '../../../lib/forecast';
import { calculateRecentProfits } from '../../../lib/profit';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { storeId } = req.body;
  if (!storeId) return res.status(400).json({ error: 'storeId is required' });

  try {
    // Step 1: Sync orders from Shopify
    const orderResult = await syncOrders(storeId);

    // Step 2: Sync products from Shopify
    const productResult = await syncProducts(storeId);

    // Step 3: Check for bad addresses
    const flaggedAddresses = await checkAddresses(storeId);

    // Step 4: Auto-send address verification emails
    await autoSendAddressEmails(storeId);

    // Step 5: Update sales velocity for forecasting
    await updateSalesVelocity(storeId);

    // Step 6: Update profit calculations
    await calculateRecentProfits(storeId);

    return res.json({
      success: true,
      synced: {
        orders: orderResult.synced,
        products: productResult.synced,
        flaggedAddresses: flaggedAddresses.length,
      },
    });
  } catch (error) {
    console.error('Sync error:', error);
    return res.status(500).json({ error: error.message });
  }
}
