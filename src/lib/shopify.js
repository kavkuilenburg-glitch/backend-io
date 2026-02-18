// ============================================
// Shopify API Helper
// ============================================
// Handles syncing orders, products, and fulfillments
// from your Shopify store into our database.
// ============================================

import Shopify from 'shopify-api-node';
import { prisma } from './db';

// Create a Shopify client for a given store
export function createShopifyClient(store) {
  return new Shopify({
    shopName: store.shopifyUrl.replace('.myshopify.com', ''),
    accessToken: store.accessToken,
    apiVersion: '2024-01',
  });
}

// ---- SYNC ORDERS ----
// Pulls recent orders from Shopify and saves them to our database
export async function syncOrders(storeId) {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error('Store not found');

  const shopify = createShopifyClient(store);

  // Get orders from last 30 days
  const orders = await shopify.order.list({
    status: 'any',
    limit: 250,
    created_at_min: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  for (const order of orders) {
    const address = order.shipping_address || {};
    const lineItem = order.line_items?.[0];

    // Check if address looks valid (basic validation)
    const addressValid = !!(
      address.address1 &&
      address.city &&
      address.zip &&
      address.country_code
    );

    // Determine our status from Shopify's fulfillment status
    let status = 'unfulfilled';
    if (order.fulfillment_status === 'fulfilled') status = 'delivered';
    else if (order.fulfillment_status === 'partial') status = 'shipped';
    else if (order.cancelled_at) status = 'cancelled';

    // Get tracking info from fulfillments
    const fulfillment = order.fulfillments?.[0];
    const trackingNumber = fulfillment?.tracking_number || null;
    const trackingUrl = fulfillment?.tracking_url || null;
    const carrier = fulfillment?.tracking_company || null;

    await prisma.order.upsert({
      where: { shopifyId: String(order.id) },
      update: {
        status,
        address: [address.address1, address.address2].filter(Boolean).join(', '),
        city: address.city || '',
        zip: address.zip || '',
        country: address.country_code || '',
        addressValid,
        trackingNumber,
        trackingUrl,
        carrier,
        updatedAt: new Date(),
      },
      create: {
        shopifyId: String(order.id),
        orderNumber: `#${order.order_number}`,
        customerName: `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim(),
        customerEmail: order.customer?.email || order.email || '',
        product: lineItem?.title || 'Unknown Product',
        amount: parseFloat(order.total_price),
        currency: order.currency,
        status,
        date: new Date(order.created_at),
        address: [address.address1, address.address2].filter(Boolean).join(', '),
        city: address.city || '',
        zip: address.zip || '',
        country: address.country_code || '',
        addressValid,
        trackingNumber,
        trackingUrl,
        carrier,
        storeId: store.id,
      },
    });
  }

  return { synced: orders.length };
}

// ---- SYNC PRODUCTS ----
// Pulls products from Shopify and saves them to our database
export async function syncProducts(storeId) {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error('Store not found');

  const shopify = createShopifyClient(store);

  const products = await shopify.product.list({ limit: 250 });

  for (const product of products) {
    const variant = product.variants?.[0];
    if (!variant) continue;

    await prisma.product.upsert({
      where: { shopifyId: String(product.id) },
      update: {
        name: product.title,
        price: parseFloat(variant.price),
        stock: variant.inventory_quantity || 0,
        inStock: (variant.inventory_quantity || 0) > 0,
        imageUrl: product.image?.src || null,
        sku: variant.sku || '',
        updatedAt: new Date(),
      },
      create: {
        shopifyId: String(product.id),
        name: product.title,
        price: parseFloat(variant.price),
        stock: variant.inventory_quantity || 0,
        inStock: (variant.inventory_quantity || 0) > 0,
        imageUrl: product.image?.src || null,
        sku: variant.sku || '',
        storeId: store.id,
      },
    });
  }

  return { synced: products.length };
}

// ---- UPDATE PRODUCT STOCK ON SHOPIFY ----
// When you toggle a product in/out of stock in our app,
// this updates it on Shopify too
export async function updateProductStock(productId, inStock) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { store: true },
  });
  if (!product) throw new Error('Product not found');

  const shopify = createShopifyClient(product.store);

  // Get the inventory item ID from Shopify
  const shopifyProduct = await shopify.product.get(parseInt(product.shopifyId));
  const variant = shopifyProduct.variants[0];

  if (variant?.inventory_item_id) {
    // Get inventory levels
    const levels = await shopify.inventoryLevel.list({
      inventory_item_ids: variant.inventory_item_id,
    });

    if (levels.length > 0) {
      await shopify.inventoryLevel.set({
        inventory_item_id: variant.inventory_item_id,
        location_id: levels[0].location_id,
        available: inStock ? (product.stock > 0 ? product.stock : 1) : 0,
      });
    }
  }

  // Update our database
  await prisma.product.update({
    where: { id: productId },
    data: { inStock },
  });
}
