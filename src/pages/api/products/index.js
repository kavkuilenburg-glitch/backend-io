// /api/products — GET list, PATCH toggle stock
import { prisma } from '../../../lib/db';
import { getStockForecast } from '../../../lib/forecast';

export default async function handler(req, res) {
  const { storeId } = req.query;

  if (req.method === 'GET') {
    const where = {};
    if (storeId && storeId !== 'any') where.storeId = storeId;

    const forecast = req.query.forecast === 'true';

    if (forecast) {
      const data = await getStockForecast(storeId);
      return res.json(data);
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return res.json(products);
  }

  if (req.method === 'PATCH') {
    const { productId, inStock, cost } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId required' });

    const data = {};
    if (typeof inStock === 'boolean') data.inStock = inStock;
    if (typeof cost === 'number') data.cost = cost;

    const product = await prisma.product.update({
      where: { id: productId },
      data,
    });

    return res.json(product);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
