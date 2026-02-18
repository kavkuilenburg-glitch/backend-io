// /api/profit — GET profit data, PATCH update entry
import { prisma } from '../../../lib/db';

export default async function handler(req, res) {
  const { storeId } = req.query;

  if (req.method === 'GET') {
    if (!storeId) return res.status(400).json({ error: 'storeId required' });

    const entries = await prisma.profitEntry.findMany({
      where: { storeId },
      orderBy: { month: 'asc' },
    });

    return res.json(entries);
  }

  if (req.method === 'PATCH') {
    const { entryId, costs, adSpend, shipping, otherCosts } = req.body;
    if (!entryId) return res.status(400).json({ error: 'entryId required' });

    const existing = await prisma.profitEntry.findUnique({ where: { id: entryId } });
    if (!existing) return res.status(404).json({ error: 'Entry not found' });

    const updatedCosts = costs ?? existing.costs;
    const updatedAdSpend = adSpend ?? existing.adSpend;
    const updatedShipping = shipping ?? existing.shipping;
    const updatedOtherCosts = otherCosts ?? existing.otherCosts;
    const profit = existing.revenue - updatedCosts - updatedAdSpend - updatedShipping - updatedOtherCosts;

    const entry = await prisma.profitEntry.update({
      where: { id: entryId },
      data: { costs: updatedCosts, adSpend: updatedAdSpend, shipping: updatedShipping, otherCosts: updatedOtherCosts, profit },
    });

    return res.json(entry);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
