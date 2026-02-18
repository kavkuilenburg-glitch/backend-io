// /api/emails — GET list, POST send manual email
import { prisma } from '../../../lib/db';
import { sendEmail, wrongAddressEmail, postOfficeEmail } from '../../../lib/email';

export default async function handler(req, res) {
  const { storeId } = req.query;

  if (req.method === 'GET') {
    const where = {};
    if (storeId && storeId !== 'any') where.storeId = storeId;

    const emails = await prisma.email.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.json(emails);
  }

  if (req.method === 'POST') {
    const { orderId, type } = req.body;
    if (!orderId || !type) return res.status(400).json({ error: 'orderId and type required' });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    let template;
    if (type === 'wrong_address') template = wrongAddressEmail(order, order.store);
    else if (type === 'post_office') template = postOfficeEmail(order, order.store);
    else return res.status(400).json({ error: 'Invalid email type' });

    const email = await sendEmail({
      to: order.customerEmail,
      customer: order.customerName,
      subject: template.subject,
      html: template.html,
      type,
      orderId: order.id,
      storeId: order.storeId,
    });

    return res.json(email);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
