// ============================================
// Email Helper
// ============================================
// Handles sending all emails — address verification,
// tracking updates, post office pickup, and flow emails.
// Uses SMTP (works with Resend, Mailgun, Gmail, etc.)
// ============================================

import nodemailer from 'nodemailer';
import { prisma } from './db';

// Create the email transporter (SMTP connection)
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: parseInt(process.env.SMTP_PORT || '465') === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ---- SEND AN EMAIL AND LOG IT ----
export async function sendEmail({ to, customer, subject, html, type, orderId, storeId }) {
  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: `"Backend.io" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    // Log the email in our database
    const email = await prisma.email.create({
      data: {
        to,
        customer,
        subject,
        body: html,
        type,
        status: 'sent',
        sentAt: new Date(),
        orderId,
        storeId,
      },
    });

    return email;
  } catch (error) {
    // Log the failed attempt
    await prisma.email.create({
      data: {
        to,
        customer,
        subject,
        body: html,
        type,
        status: 'failed',
        orderId,
        storeId,
      },
    });
    throw error;
  }
}

// ---- EMAIL TEMPLATES ----

export function wrongAddressEmail(order, store) {
  return {
    subject: `Action Required: Please verify your shipping address — Order ${order.orderNumber}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #fafafa; border-radius: 12px;">
        <h2 style="color: #1a1a2e; margin-bottom: 8px;">Hi ${order.customerName.split(' ')[0]},</h2>
        <p style="color: #555; line-height: 1.7; font-size: 15px;">
          We're getting your order <strong>${order.orderNumber}</strong> ready to ship, but we noticed
          there might be an issue with your shipping address:
        </p>
        <div style="background: #fff3f3; border: 1px solid #ffcccc; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="color: #cc4444; margin: 0; font-family: monospace; font-size: 14px;">
            ${order.address}${order.city ? `, ${order.city}` : ''}${order.zip ? ` ${order.zip}` : ''}
          </p>
        </div>
        <p style="color: #555; line-height: 1.7; font-size: 15px;">
          Could you please reply to this email with your correct, full shipping address?
          We want to make sure your package arrives safely.
        </p>
        <p style="color: #555; line-height: 1.7; font-size: 15px;">
          Just reply with:<br>
          <em>Street + number, Postal code, City, Country</em>
        </p>
        <p style="color: #999; font-size: 13px; margin-top: 24px;">
          Thanks for your patience!<br>
          — ${store.name || 'The Team'}
        </p>
      </div>
    `,
  };
}

export function postOfficeEmail(order, store) {
  return {
    subject: `Your package is ready for pickup! — Order ${order.orderNumber}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #fafafa; border-radius: 12px;">
        <h2 style="color: #1a1a2e; margin-bottom: 8px;">Hi ${order.customerName.split(' ')[0]},</h2>
        <p style="color: #555; line-height: 1.7; font-size: 15px;">
          Great news! Your package for order <strong>${order.orderNumber}</strong> has arrived at your
          local post office and is ready for pickup.
        </p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
          <p style="color: #166534; margin: 0; font-size: 14px; font-weight: 600;">
            📦 Tracking: ${order.trackingNumber || 'See below'}
          </p>
        </div>
        ${order.trackingNumber ? `
        <p style="text-align: center; margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_TRACKING_URL}/${order.trackingNumber}"
             style="display: inline-block; background: #6366f1; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Track Your Package
          </a>
        </p>
        ` : ''}
        <p style="color: #555; line-height: 1.7; font-size: 15px;">
          Please pick it up within 7 days. Don't forget to bring a valid ID!
        </p>
        <p style="color: #999; font-size: 13px; margin-top: 24px;">
          — ${store.name || 'The Team'}
        </p>
      </div>
    `,
  };
}

export function shippedEmail(order, store) {
  return {
    subject: `Your order is on its way! — Order ${order.orderNumber}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #fafafa; border-radius: 12px;">
        <h2 style="color: #1a1a2e; margin-bottom: 8px;">Hi ${order.customerName.split(' ')[0]},</h2>
        <p style="color: #555; line-height: 1.7; font-size: 15px;">
          Your order <strong>${order.orderNumber}</strong> has been shipped! 🎉
        </p>
        ${order.trackingNumber ? `
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="color: #1e40af; margin: 0 0 4px; font-size: 13px; font-weight: 600;">TRACKING NUMBER</p>
          <p style="color: #1e40af; margin: 0; font-family: monospace; font-size: 16px;">${order.trackingNumber}</p>
          ${order.carrier ? `<p style="color: #6b7280; margin: 4px 0 0; font-size: 12px;">Carrier: ${order.carrier}</p>` : ''}
        </div>
        <p style="text-align: center; margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_TRACKING_URL}/${order.trackingNumber}"
             style="display: inline-block; background: #6366f1; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Track Your Package
          </a>
        </p>
        ` : ''}
        <p style="color: #999; font-size: 13px; margin-top: 24px;">
          — ${store.name || 'The Team'}
        </p>
      </div>
    `,
  };
}

export function deliveredEmail(order, store) {
  return {
    subject: `Your order has been delivered! — Order ${order.orderNumber}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #fafafa; border-radius: 12px;">
        <h2 style="color: #1a1a2e; margin-bottom: 8px;">Hi ${order.customerName.split(' ')[0]},</h2>
        <p style="color: #555; line-height: 1.7; font-size: 15px;">
          Your order <strong>${order.orderNumber}</strong> has been delivered! We hope you love it. ✅
        </p>
        <p style="color: #555; line-height: 1.7; font-size: 15px;">
          If something isn't right or you have any questions, don't hesitate to reach out —
          we're here to help.
        </p>
        <p style="color: #999; font-size: 13px; margin-top: 24px;">
          Thanks for shopping with us!<br>
          — ${store.name || 'The Team'}
        </p>
      </div>
    `,
  };
}
