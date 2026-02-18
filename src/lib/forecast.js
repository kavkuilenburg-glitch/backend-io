// ============================================
// Stock Forecaster
// ============================================
// Predicts when products will run out of stock
// based on rolling sales velocity.
// ============================================

import { prisma } from './db';

// Calculate sales velocity (average units sold per day) for each product
export async function updateSalesVelocity(storeId) {
  const products = await prisma.product.findMany({ where: { storeId } });

  // Get orders from last 30 days to calculate velocity
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: {
      storeId,
      date: { gte: thirtyDaysAgo },
      status: { in: ['shipped', 'delivered', 'at_post_office', 'unfulfilled'] },
    },
  });

  // Count how many times each product was ordered
  const productSales = {};
  for (const order of orders) {
    const name = order.product;
    productSales[name] = (productSales[name] || 0) + 1;
  }

  // Update each product's salesPerDay
  for (const product of products) {
    const totalSold = productSales[product.name] || 0;
    const salesPerDay = totalSold / 30;

    await prisma.product.update({
      where: { id: product.id },
      data: { salesPerDay },
    });
  }
}

// Get stock forecast for all products
export async function getStockForecast(storeId) {
  const products = await prisma.product.findMany({
    where: { storeId, inStock: true },
    orderBy: { stock: 'asc' },
  });

  return products.map(product => {
    const daysUntilOut = product.salesPerDay > 0
      ? Math.floor(product.stock / product.salesPerDay)
      : Infinity;

    let urgency = 'ok';
    if (daysUntilOut <= 3) urgency = 'critical';
    else if (daysUntilOut <= 7) urgency = 'warning';
    else if (daysUntilOut <= 14) urgency = 'attention';

    // Suggested reorder quantity (30 days of stock)
    const reorderQty = Math.ceil(product.salesPerDay * 30);

    return {
      ...product,
      daysUntilOut,
      urgency,
      reorderQty,
    };
  });
}
