// GET /api/auth/callback — Handle Shopify OAuth callback
import { prisma } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  var code = req.query.code;
  var shop = req.query.shop;
  var clientId = process.env.SHOPIFY_CLIENT_ID;
  var clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!code || !shop) {
    return res.status(400).json({ error: 'Missing code or shop parameter' });
  }

  try {
    // Exchange code for access token
    var tokenRes = await fetch("https://" + shop + "/admin/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    var tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.status(400).json({ error: "Failed to get access token" });
    }

    var accessToken = tokenData.access_token;

    // Get shop info
    var shopRes = await fetch("https://" + shop + "/admin/api/2024-01/shop.json", {
      headers: { "X-Shopify-Access-Token": accessToken },
    });
    var shopData = await shopRes.json();

    // Save store
    var store = await prisma.store.upsert({
      where: { shopifyUrl: shop },
      update: { accessToken: accessToken, name: shopData.shop ? shopData.shop.name : shop, email: shopData.shop ? shopData.shop.email : "" },
      create: { shopifyUrl: shop, accessToken: accessToken, name: shopData.shop ? shopData.shop.name : shop, email: shopData.shop ? shopData.shop.email : "" },
    });

    // Create default tracking config
    await prisma.trackingConfig.upsert({
      where: { storeId: store.id },
      update: {},
      create: {
        storeId: store.id,
        theme: { primary: "#6366f1", accent: "#34d399", bg: "#0a0a16", text: "#e2e8f0", storeName: store.name },
        sections: [],
      },
    }).catch(function() {});

    // Redirect back to dashboard
    res.redirect("/?connected=" + store.id);
  } catch (error) {
    console.error("OAuth error:", error);
    res.status(500).json({ error: error.message });
  }
}
