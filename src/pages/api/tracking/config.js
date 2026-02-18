// /api/tracking/config — GET/PUT tracking page customizer config
import { prisma } from '../../../lib/db';

export default async function handler(req, res) {
  const { storeId } = req.query;

  if (req.method === 'GET') {
    if (!storeId) return res.status(400).json({ error: 'storeId required' });

    const config = await prisma.trackingConfig.findUnique({
      where: { storeId },
    });

    return res.json(config || { theme: {}, sections: [] });
  }

  if (req.method === 'PUT') {
    const { theme, sections, customCss, customHead } = req.body;
    if (!storeId) return res.status(400).json({ error: 'storeId required' });

    const config = await prisma.trackingConfig.upsert({
      where: { storeId },
      update: {
        ...(theme && { theme }),
        ...(sections && { sections }),
        ...(customCss !== undefined && { customCss }),
        ...(customHead !== undefined && { customHead }),
      },
      create: {
        storeId,
        theme: theme || {},
        sections: sections || [],
        customCss: customCss || '',
        customHead: customHead || '',
      },
    });

    return res.json(config);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
