// ============================================
// Database Seed — Run with: npm run db:seed
// ============================================
// This creates sample data so you can test the app
// before connecting a real Shopify store.
// ============================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a demo store
  const store = await prisma.store.upsert({
    where: { shopifyUrl: 'demo-store.myshopify.com' },
    update: {},
    create: {
      shopifyUrl: 'demo-store.myshopify.com',
      accessToken: 'demo-token',
      name: 'Demo Store',
      email: 'owner@demo-store.com',
    },
  });

  console.log('  ✅ Store created:', store.name);

  // Create sample products
  const products = [
    { shopifyId: '1001', name: 'Wireless Earbuds Pro', sku: 'WEP-001', price: 89.99, cost: 22.00, stock: 47, salesPerDay: 3.2, inStock: true },
    { shopifyId: '1002', name: 'Phone Case Ultra', sku: 'PCU-002', price: 24.99, cost: 4.50, stock: 182, salesPerDay: 8.1, inStock: true },
    { shopifyId: '1003', name: 'USB-C Hub 7-in-1', sku: 'UCH-003', price: 45.00, cost: 12.00, stock: 8, salesPerDay: 2.4, inStock: true },
    { shopifyId: '1004', name: 'LED Desk Lamp', sku: 'LDL-004', price: 67.50, cost: 18.00, stock: 0, salesPerDay: 1.8, inStock: false },
    { shopifyId: '1005', name: 'Bluetooth Speaker Mini', sku: 'BSM-005', price: 39.99, cost: 9.50, stock: 93, salesPerDay: 5.0, inStock: true },
    { shopifyId: '1006', name: 'Laptop Stand Ergonomic', sku: 'LSE-006', price: 54.00, cost: 15.00, stock: 31, salesPerDay: 1.5, inStock: true },
    { shopifyId: '1007', name: 'Wireless Charger Pad', sku: 'WCP-007', price: 29.99, cost: 6.00, stock: 3, salesPerDay: 4.2, inStock: true },
    { shopifyId: '1008', name: 'Screen Protector 3-Pack', sku: 'SP3-008', price: 14.99, cost: 1.80, stock: 412, salesPerDay: 12.0, inStock: true },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { shopifyId: p.shopifyId },
      update: {},
      create: { ...p, storeId: store.id },
    });
  }
  console.log(`  ✅ ${products.length} products created`);

  // Create sample orders
  const orders = [
    { shopifyId: '4012', orderNumber: '#4012', customerName: 'Emma van Dijk', customerEmail: 'emma@email.com', product: 'Wireless Earbuds Pro', amount: 89.99, status: 'unfulfilled', date: new Date('2026-02-17'), address: 'Kerkstraat 42', city: 'Amsterdam', zip: '1017 GH', country: 'NL', addressValid: true },
    { shopifyId: '4011', orderNumber: '#4011', customerName: 'Lucas de Vries', customerEmail: 'lucas@email.com', product: 'Phone Case Ultra', amount: 24.99, status: 'unfulfilled', date: new Date('2026-02-17'), address: 'Hoofdweg 1A', city: '', zip: 'INVALID', country: 'NL', addressValid: false },
    { shopifyId: '4010', orderNumber: '#4010', customerName: 'Sophie Jansen', customerEmail: 'sophie@email.com', product: 'USB-C Hub 7-in-1', amount: 45.00, status: 'shipped', date: new Date('2026-02-16'), address: 'Bergstraat 15', city: 'Arnhem', zip: '6811 AB', country: 'NL', addressValid: true, trackingNumber: 'NL4829104821', carrier: 'PostNL' },
    { shopifyId: '4009', orderNumber: '#4009', customerName: 'Noah Bakker', customerEmail: 'noah@email.com', product: 'LED Desk Lamp', amount: 67.50, status: 'at_post_office', date: new Date('2026-02-15'), address: 'Velperplein 8', city: 'Arnhem', zip: '6811 AG', country: 'NL', addressValid: true, trackingNumber: 'NL9281048211', carrier: 'PostNL' },
    { shopifyId: '4008', orderNumber: '#4008', customerName: 'Mila Smit', customerEmail: 'mila@email.com', product: 'Bluetooth Speaker Mini', amount: 39.99, status: 'delivered', date: new Date('2026-02-14'), address: 'Rijnkade 30', city: 'Arnhem', zip: '6811 HA', country: 'NL', addressValid: true, trackingNumber: 'NL1029384756', carrier: 'PostNL' },
    { shopifyId: '4007', orderNumber: '#4007', customerName: 'Daan Peters', customerEmail: 'daan@email.com', product: 'Wireless Earbuds Pro', amount: 89.99, status: 'unfulfilled', date: new Date('2026-02-14'), address: 'Fakestreet 999', city: '', zip: '0000 XX', country: 'NL', addressValid: false },
  ];

  for (const o of orders) {
    await prisma.order.upsert({
      where: { shopifyId: o.shopifyId },
      update: {},
      create: { ...o, storeId: store.id },
    });
  }
  console.log(`  ✅ ${orders.length} orders created`);

  // Create tracking events for shipped/delivered orders
  const sophieOrder = await prisma.order.findFirst({ where: { shopifyId: '4010' } });
  if (sophieOrder) {
    await prisma.trackingEvent.createMany({
      data: [
        { orderId: sophieOrder.id, status: 'shipped', description: 'Package shipped from warehouse', location: 'Rotterdam, NL', timestamp: new Date('2026-02-16T08:00:00Z') },
        { orderId: sophieOrder.id, status: 'in_transit', description: 'Package in transit to sorting center', location: 'Utrecht, NL', timestamp: new Date('2026-02-16T14:30:00Z') },
        { orderId: sophieOrder.id, status: 'in_transit', description: 'Package arrived at local distribution', location: 'Arnhem, NL', timestamp: new Date('2026-02-17T06:00:00Z') },
      ],
      skipDuplicates: true,
    });
  }

  // Create tracking config
  await prisma.trackingConfig.upsert({
    where: { storeId: store.id },
    update: {},
    create: {
      storeId: store.id,
      theme: JSON.stringify({ primary: '#6366f1', accent: '#34d399', bg: '#0a0a16', text: '#e2e8f0', storeName: 'Demo Store' }),
      sections: JSON.stringify([
        { id: 's1', type: 'announcement_bar', enabled: true, settings: {}, blocks: [{ id: 'b1', type: 'text', settings: { text: 'Free shipping on all orders above €50!' } }] },
        { id: 's2', type: 'hero_banner', enabled: true, settings: {}, blocks: [] },
        { id: 's3', type: 'tracking_timeline', enabled: true, settings: {}, blocks: [] },
        { id: 's4', type: 'order_details', enabled: true, settings: {}, blocks: [] },
        { id: 's5', type: 'product_recommendations', enabled: true, settings: {}, blocks: [] },
        { id: 's6', type: 'support_contact', enabled: true, settings: {}, blocks: [] },
      ]),
    },
  });
  console.log('  ✅ Tracking config created');

  // Create profit entries
  const profitMonths = [
    { month: '2025-09', revenue: 4280, costs: 1420, adSpend: 890, shipping: 320 },
    { month: '2025-10', revenue: 5120, costs: 1680, adSpend: 1020, shipping: 410 },
    { month: '2025-11', revenue: 8940, costs: 2890, adSpend: 1800, shipping: 720 },
    { month: '2025-12', revenue: 12400, costs: 4100, adSpend: 2400, shipping: 980 },
    { month: '2026-01', revenue: 6780, costs: 2240, adSpend: 1350, shipping: 540 },
    { month: '2026-02', revenue: 4890, costs: 1610, adSpend: 980, shipping: 390 },
  ];

  for (const p of profitMonths) {
    const profit = p.revenue - p.costs - p.adSpend - p.shipping;
    await prisma.profitEntry.upsert({
      where: { storeId_month: { storeId: store.id, month: p.month } },
      update: {},
      create: { ...p, profit, otherCosts: 0, storeId: store.id },
    });
  }
  console.log('  ✅ Profit entries created');

  console.log('\n🎉 Seed complete! Your demo store is ready.');
  console.log(`   Store ID: ${store.id}`);
  console.log('   Test tracking page: http://localhost:3000/track/NL4829104821\n');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
