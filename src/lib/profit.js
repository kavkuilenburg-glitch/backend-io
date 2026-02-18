// ============================================
// Profit Calculator
// ============================================
// Auto-generates monthly profit entries by
// calculating revenue from orders and costs
// from product COGS.
// ============================================

import { prisma } from './db';

export async function calculateMonthlyProfit(storeId, monthStr) {
  // monthStr format: "2026-02"
  const [year, month] = monthStr.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  // Get all delivered/shipped orders in this month
  const orders = await prisma.order.findMany({
    where: {
      storeId,
      date: { gte: startDate, lt: endDate },
      status: { in: ['shipped', 'delivered', 'at_post_office'] },
    },
  });

  // Calculate revenue
  const revenue = orders.reduce((sum, o) => sum + o.amount, 0);

  // Get the existing entry or create defaults
  const existing = await prisma.profitEntry.findUnique({
    where: { storeId_month: { storeId, month: monthStr } },
  });

  // COGS: try to calculate from product costs
  let costs = existing?.costs || 0;
  if (!existing) {
    // Rough estimate: get average cost ratio from products
    const products = await prisma.product.findMany({ where: { storeId } });
    const avgCostRatio = products.length > 0
      ? products.reduce((sum, p) => sum + (p.cost / (p.price || 1)), 0) / products.length
      : 0.3; // default 30% COGS
    costs = revenue * avgCostRatio;
  }

  const adSpend = existing?.adSpend || 0;
  const shipping = existing?.shipping || (orders.length * 4.5); // rough €4.50 per order default
  const otherCosts = existing?.otherCosts || 0;
  const profit = revenue - costs - adSpend - shipping - otherCosts;

  return prisma.profitEntry.upsert({
    where: { storeId_month: { storeId, month: monthStr } },
    update: { revenue, profit, updatedAt: new Date() },
    create: {
      storeId,
      month: monthStr,
      revenue,
      costs,
      adSpend,
      shipping,
      otherCosts,
      profit,
    },
  });
}

// Calculate last 6 months
export async function calculateRecentProfits(storeId) {
  const results = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const entry = await calculateMonthlyProfit(storeId, monthStr);
    results.push(entry);
  }
  return results;
}
