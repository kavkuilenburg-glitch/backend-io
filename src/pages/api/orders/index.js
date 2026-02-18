// /api/orders — GET list, PATCH update status
import { prisma } from '../../../lib/db';
import { sendEmail, postOfficeEmail, shippedEmail, deliveredEmail } from '../../../lib/email';

export default async function handler(req, res) {
  const { storeId, status, search } = req.query;

  if (req.method === 'GET') {
    if (!storeId) return res.status(400).json({ error: 'storeId required' });

    const where = { storeId };
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { orderNumber: { contains: search } },
        { product: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 100,
    });

    return res.json(orders);
  }

  if (req.method === 'PATCH') {
    const { orderId, newStatus } = req.body;
    if (!orderId || !newStatus) return res.status(400).json({ error: 'orderId and newStatus required' });

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: { store: true },
    });

    // Auto-send emails based on status change
    try {
      if (newStatus === 'shipped') {
        const template = shippedEmail(order, order.store);
        await sendEmail({ to: order.customerEmail, customer: order.customerName, subject: template.subject, html: template.html, type: 'tracking_update', orderId: order.id, storeId: order.storeId });
      } else if (newStatus === 'at_post_office') {
        const template = postOfficeEmail(order, order.store);
        await sendEmail({ to: order.customerEmail, customer: order.customerName, subject: template.subject, html: template.html, type: 'post_office', orderId: order.id, storeId: order.storeId });
      } else if (newStatus === 'delivered') {
        const template = deliveredEmail(order, order.store);
        await sendEmail({ to: order.customerEmail, customer: order.customerName, subject: template.subject, html: template.html, type: 'tracking_update', orderId: order.id, storeId: order.storeId });
      }
    } catch (emailErr) {
      console.error('Auto-email failed:', emailErr);
      // Don't fail the status update if email fails
    }

    return res.json(order);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
