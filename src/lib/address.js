// ============================================
// Address Validation Helper
// ============================================
// Detects invalid/incomplete shipping addresses
// and auto-triggers emails to customers.
// ============================================

import { prisma } from './db';
import { sendEmail, wrongAddressEmail } from './email';

// Simple address validation rules
// Returns true if address LOOKS invalid
export function isAddressInvalid(order) {
  const { address, city, zip, country } = order;

  // No address at all
  if (!address || address.trim().length < 5) return true;

  // No city
  if (!city || city.trim().length < 2) return true;

  // No zip/postal code
  if (!zip || zip.trim().length < 3) return true;

  // Contains obvious placeholder text
  const placeholders = ['test', 'asdf', 'xxx', '000', 'fake', 'none', 'n/a', '123 street'];
  const lowerAddr = (address + city + zip).toLowerCase();
  if (placeholders.some(p => lowerAddr.includes(p))) return true;

  // Zip code is all zeros
  if (/^0+$/.test(zip.replace(/\s/g, ''))) return true;

  // Netherlands-specific: postal code should be 4 digits + 2 letters
  if (country === 'NL' && !/^\d{4}\s?[A-Za-z]{2}$/.test(zip.trim())) return true;

  // US-specific: zip should be 5 or 9 digits
  if (country === 'US' && !/^\d{5}(-\d{4})?$/.test(zip.trim())) return true;

  return false;
}

// ---- CHECK ALL UNFULFILLED ORDERS FOR BAD ADDRESSES ----
// Run this after syncing orders
export async function checkAddresses(storeId) {
  const orders = await prisma.order.findMany({
    where: {
      storeId,
      status: 'unfulfilled',
      addressValid: true, // only check ones we haven't flagged yet
    },
  });

  const flagged = [];

  for (const order of orders) {
    if (isAddressInvalid(order)) {
      // Flag it in the database
      await prisma.order.update({
        where: { id: order.id },
        data: { addressValid: false },
      });
      flagged.push(order);
    }
  }

  return flagged;
}

// ---- AUTO-SEND ADDRESS VERIFICATION EMAILS ----
export async function autoSendAddressEmails(storeId) {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) return;

  // Find flagged orders that haven't been emailed yet
  const flaggedOrders = await prisma.order.findMany({
    where: {
      storeId,
      addressValid: false,
      status: 'unfulfilled',
    },
  });

  for (const order of flaggedOrders) {
    // Check if we already sent an address email for this order
    const existingEmail = await prisma.email.findFirst({
      where: {
        orderId: order.id,
        type: 'wrong_address',
        status: 'sent',
      },
    });

    if (!existingEmail) {
      const template = wrongAddressEmail(order, store);
      await sendEmail({
        to: order.customerEmail,
        customer: order.customerName,
        subject: template.subject,
        html: template.html,
        type: 'wrong_address',
        orderId: order.id,
        storeId: store.id,
      });
    }
  }
}

// ---- SEND FOLLOW-UP IF NO REPLY ----
// Run this daily — re-sends to people who haven't replied in X days
export async function sendFollowUps(storeId, daysBeforeFollowUp = 3) {
  const cutoff = new Date(Date.now() - daysBeforeFollowUp * 24 * 60 * 60 * 1000);

  const unrepliedEmails = await prisma.email.findMany({
    where: {
      storeId,
      type: 'wrong_address',
      status: 'sent',
      repliedAt: null,
      sentAt: { lt: cutoff },
    },
    include: { order: true },
  });

  const store = await prisma.store.findUnique({ where: { id: storeId } });

  for (const email of unrepliedEmails) {
    if (!email.order || email.order.addressValid) continue; // already fixed

    // Check we haven't already sent a follow-up
    const followUpCount = await prisma.email.count({
      where: {
        orderId: email.orderId,
        type: 'wrong_address',
        status: 'sent',
      },
    });

    if (followUpCount < 3) { // max 3 attempts
      const template = wrongAddressEmail(email.order, store);
      await sendEmail({
        to: email.to,
        customer: email.customer,
        subject: `Reminder: ${template.subject}`,
        html: template.html,
        type: 'wrong_address',
        orderId: email.orderId,
        storeId,
      });
    }
  }
}
