import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'contact@talelio.shop';
const ADMIN_EMAIL = 'talelio@outlook.com';
const BRAND_NAME = 'Talelio';

interface OrderItem {
  Name?: string;
  name?: string;
  Brand?: string;
  brand?: string;
  Price?: number;
  price?: number;
  qty?: number;
  quantity?: number;
  size?: string;
}

interface ShippingAddress {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  gouvernorat?: string;
  postalCode?: string;
  notes?: string;
}

interface SendOrderEmailsParams {
  orderId: string;
  buyerEmail: string;
  buyerName: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  itemsPrice: number;
  shippingPrice: number;
  totalPrice: number;
  appliedPromoCode?: string;
}

// ─── Shared style constants ──────────────────────────────────────────────────

const BASE_STYLES = `
  body { margin: 0; padding: 0; background-color: #f5f4f0; font-family: Georgia, 'Times New Roman', serif; }
  * { box-sizing: border-box; }
`;

function goldDivider() {
  return `<div style="height:1px;background:linear-gradient(to right,transparent,#c9a96e,transparent);margin:24px 0;"></div>`;
}

function renderItemsTable(items: OrderItem[]): string {
  const rows = items.map((item) => {
    const name = item.Name || item.name || 'Produit';
    const brand = item.Brand || item.brand || '';
    const price = (item.Price || item.price || 0).toFixed(2);
    const qty = item.qty || item.quantity || 1;
    const size = item.size ? ` — ${item.size}` : '';
    return `
      <tr>
        <td style="padding:12px 8px;border-bottom:1px solid #ede8df;vertical-align:top;">
          <div style="font-weight:600;color:#1a1a1a;font-size:14px;">${name}</div>
          ${brand ? `<div style="color:#9a8060;font-size:12px;margin-top:2px;font-style:italic;">${brand}${size}</div>` : ''}
        </td>
        <td style="padding:12px 8px;border-bottom:1px solid #ede8df;text-align:center;color:#555;font-size:14px;">${qty}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #ede8df;text-align:right;color:#1a1a1a;font-size:14px;font-weight:600;">${price} DT</td>
      </tr>`;
  }).join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Georgia,serif;">
      <thead>
        <tr style="background:#f9f6f0;">
          <th style="padding:10px 8px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#9a8060;font-weight:600;border-bottom:2px solid #c9a96e;">Article</th>
          <th style="padding:10px 8px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#9a8060;font-weight:600;border-bottom:2px solid #c9a96e;">Qté</th>
          <th style="padding:10px 8px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#9a8060;font-weight:600;border-bottom:2px solid #c9a96e;">Prix</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ─── Buyer confirmation email ────────────────────────────────────────────────

function buildBuyerEmail(params: SendOrderEmailsParams): string {
  const {
    orderId,
    buyerName,
    items,
    shippingAddress,
    itemsPrice,
    shippingPrice,
    totalPrice,
    appliedPromoCode,
  } = params;

  const shortId = orderId.slice(-8).toUpperCase();
  const firstName = (shippingAddress.fullName || buyerName).split(' ')[0];

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmation de commande — ${BRAND_NAME}</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1612 0%,#2d2520 100%);padding:40px 40px 32px;text-align:center;">
              <div style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#c9a96e;letter-spacing:0.12em;text-transform:uppercase;">
                ${BRAND_NAME}
              </div>
              <div style="height:1px;background:linear-gradient(to right,transparent,#c9a96e55,transparent);margin:16px auto;max-width:200px;"></div>
              <div style="font-family:Georgia,serif;font-size:13px;color:#a08060;letter-spacing:0.06em;text-transform:uppercase;">
                Parfums de Luxe
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">

              <!-- Greeting -->
              <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#1a1a1a;">
                Merci, ${firstName} !
              </h1>
              <p style="margin:0 0 24px;color:#666;font-size:14px;line-height:1.7;font-family:Georgia,serif;">
                Votre commande a été reçue et est en cours de traitement. Nous vous contacterons bientôt pour confirmer la livraison.
              </p>

              <!-- Order badge -->
              <div style="background:#f9f6f0;border:1px solid #e8e0d0;border-radius:8px;padding:16px 20px;margin-bottom:28px;display:inline-block;width:100%;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#9a8060;font-family:Georgia,serif;">Numéro de commande</div>
                      <div style="font-size:18px;font-weight:700;color:#1a1a1a;letter-spacing:0.05em;font-family:'Courier New',monospace;margin-top:4px;">#${shortId}</div>
                    </td>
                    <td style="text-align:right;">
                      <div style="display:inline-block;background:#fef9ef;border:1px solid #c9a96e;border-radius:20px;padding:6px 14px;">
                        <span style="font-size:12px;color:#9a6e20;font-weight:600;font-family:Georgia,serif;">En attente</span>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              ${goldDivider()}

              <!-- Items -->
              <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:15px;font-weight:600;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.06em;">
                Articles commandés
              </h2>
              ${renderItemsTable(items)}

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr>
                  <td style="padding:6px 8px;font-size:13px;color:#888;font-family:Georgia,serif;">Sous-total</td>
                  <td style="padding:6px 8px;text-align:right;font-size:13px;color:#555;font-family:Georgia,serif;">${itemsPrice.toFixed(2)} DT</td>
                </tr>
                <tr>
                  <td style="padding:6px 8px;font-size:13px;color:#888;font-family:Georgia,serif;">Livraison</td>
                  <td style="padding:6px 8px;text-align:right;font-size:13px;color:#555;font-family:Georgia,serif;">${shippingPrice > 0 ? `${shippingPrice.toFixed(2)} DT` : 'Gratuite'}</td>
                </tr>
                ${appliedPromoCode ? `
                <tr>
                  <td style="padding:6px 8px;font-size:13px;color:#9a8060;font-family:Georgia,serif;">Code parrainage (${appliedPromoCode})</td>
                  <td style="padding:6px 8px;text-align:right;font-size:13px;color:#9a8060;font-family:Georgia,serif;">Appliqué ✓</td>
                </tr>` : ''}
                <tr style="border-top:2px solid #c9a96e;">
                  <td style="padding:12px 8px;font-size:16px;font-weight:700;color:#1a1a1a;font-family:Georgia,serif;">Total</td>
                  <td style="padding:12px 8px;text-align:right;font-size:16px;font-weight:700;color:#1a1a1a;font-family:Georgia,serif;">${totalPrice.toFixed(2)} DT</td>
                </tr>
              </table>

              ${goldDivider()}

              <!-- Shipping address -->
              <h2 style="margin:0 0 14px;font-family:Georgia,serif;font-size:15px;font-weight:600;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.06em;">
                Adresse de livraison
              </h2>
              <div style="background:#f9f6f0;border-radius:8px;padding:16px 20px;font-size:14px;color:#444;line-height:1.8;font-family:Georgia,serif;">
                <strong style="color:#1a1a1a;">${shippingAddress.fullName || buyerName}</strong><br/>
                ${shippingAddress.phone ? `📞 ${shippingAddress.phone}<br/>` : ''}
                ${shippingAddress.address ? `${shippingAddress.address},<br/>` : ''}
                ${shippingAddress.city ? `${shippingAddress.city}` : ''}${shippingAddress.gouvernorat ? `, ${shippingAddress.gouvernorat}` : ''}${shippingAddress.postalCode ? ` ${shippingAddress.postalCode}` : ''}<br/>
                ${shippingAddress.notes ? `<span style="color:#9a8060;font-size:12px;font-style:italic;">Note: ${shippingAddress.notes}</span>` : ''}
              </div>

              ${goldDivider()}

              <!-- Payment info -->
              <div style="background:#fef9ef;border:1px solid #e8d9b0;border-radius:8px;padding:16px 20px;font-size:13px;color:#7a6030;font-family:Georgia,serif;">
                💳 <strong>Mode de paiement :</strong> Paiement à la livraison<br/>
                🚚 <strong>Délai estimé :</strong> 2 à 4 jours ouvrables
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f6f0;padding:24px 40px;text-align:center;border-top:1px solid #e8e0d0;">
              <p style="margin:0 0 8px;font-size:12px;color:#9a8060;font-family:Georgia,serif;letter-spacing:0.04em;">
                Pour toute question, contactez-nous à
                <a href="mailto:${FROM_EMAIL}" style="color:#c9a96e;text-decoration:none;">${FROM_EMAIL}</a>
              </p>
              <p style="margin:0;font-size:11px;color:#bbb;font-family:Georgia,serif;">
                © ${new Date().getFullYear()} ${BRAND_NAME} — Parfums de Luxe
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Admin notification email ────────────────────────────────────────────────

function buildAdminEmail(params: SendOrderEmailsParams): string {
  const {
    orderId,
    buyerEmail,
    buyerName,
    items,
    shippingAddress,
    itemsPrice,
    shippingPrice,
    totalPrice,
    appliedPromoCode,
  } = params;

  const shortId = orderId.slice(-8).toUpperCase();
  const now = new Date().toLocaleString('fr-TN', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nouvelle commande #${shortId} — ${BRAND_NAME}</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1612 0%,#2d2520 100%);padding:28px 40px;text-align:center;">
              <div style="font-family:Georgia,serif;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#9a8060;margin-bottom:8px;">
                ${BRAND_NAME} — Tableau de bord admin
              </div>
              <div style="background:#c9a96e;color:#1a1a1a;display:inline-block;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:700;font-family:Georgia,serif;letter-spacing:0.04em;">
                🛒 Nouvelle commande reçue
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">

              <!-- Summary row -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f6f0;border-radius:8px;overflow:hidden;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;border-right:1px solid #e8e0d0;">
                    <div style="font-size:11px;color:#9a8060;text-transform:uppercase;letter-spacing:0.06em;font-family:Georgia,serif;">Commande</div>
                    <div style="font-size:16px;font-weight:700;color:#1a1a1a;letter-spacing:0.04em;font-family:'Courier New',monospace;margin-top:4px;">#${shortId}</div>
                  </td>
                  <td style="padding:16px 20px;border-right:1px solid #e8e0d0;">
                    <div style="font-size:11px;color:#9a8060;text-transform:uppercase;letter-spacing:0.06em;font-family:Georgia,serif;">Total</div>
                    <div style="font-size:16px;font-weight:700;color:#c9a96e;margin-top:4px;font-family:Georgia,serif;">${totalPrice.toFixed(2)} DT</div>
                  </td>
                  <td style="padding:16px 20px;">
                    <div style="font-size:11px;color:#9a8060;text-transform:uppercase;letter-spacing:0.06em;font-family:Georgia,serif;">Date</div>
                    <div style="font-size:12px;color:#444;margin-top:4px;font-family:Georgia,serif;">${now}</div>
                  </td>
                </tr>
              </table>

              <!-- Client info -->
              <h2 style="margin:0 0 12px;font-family:Georgia,serif;font-size:14px;font-weight:600;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.06em;">
                Client
              </h2>
              <div style="background:#f9f6f0;border-radius:8px;padding:14px 18px;font-size:13px;color:#444;line-height:1.8;font-family:Georgia,serif;margin-bottom:24px;">
                <strong style="color:#1a1a1a;">${shippingAddress.fullName || buyerName}</strong><br/>
                📧 <a href="mailto:${buyerEmail}" style="color:#c9a96e;text-decoration:none;">${buyerEmail}</a><br/>
                ${shippingAddress.phone ? `📞 ${shippingAddress.phone}<br/>` : ''}
                ${shippingAddress.address ? `📍 ${shippingAddress.address}, ${shippingAddress.city || ''}${shippingAddress.gouvernorat ? `, ${shippingAddress.gouvernorat}` : ''}` : ''}
                ${shippingAddress.notes ? `<br/><span style="color:#9a8060;font-size:12px;font-style:italic;">Note: ${shippingAddress.notes}</span>` : ''}
              </div>

              ${goldDivider()}

              <!-- Items -->
              <h2 style="margin:0 0 14px;font-family:Georgia,serif;font-size:14px;font-weight:600;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.06em;">
                Articles (${items.length})
              </h2>
              ${renderItemsTable(items)}

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                <tr>
                  <td style="padding:5px 8px;font-size:13px;color:#888;font-family:Georgia,serif;">Sous-total</td>
                  <td style="padding:5px 8px;text-align:right;font-size:13px;color:#555;font-family:Georgia,serif;">${itemsPrice.toFixed(2)} DT</td>
                </tr>
                <tr>
                  <td style="padding:5px 8px;font-size:13px;color:#888;font-family:Georgia,serif;">Livraison</td>
                  <td style="padding:5px 8px;text-align:right;font-size:13px;color:#555;font-family:Georgia,serif;">${shippingPrice > 0 ? `${shippingPrice.toFixed(2)} DT` : 'Gratuite'}</td>
                </tr>
                ${appliedPromoCode ? `
                <tr>
                  <td style="padding:5px 8px;font-size:13px;color:#9a8060;font-family:Georgia,serif;">Code parrainage (${appliedPromoCode})</td>
                  <td style="padding:5px 8px;text-align:right;font-size:13px;color:#9a8060;font-family:Georgia,serif;">Appliqué ✓</td>
                </tr>` : ''}
                <tr style="border-top:2px solid #c9a96e;">
                  <td style="padding:10px 8px;font-size:15px;font-weight:700;color:#1a1a1a;font-family:Georgia,serif;">Total</td>
                  <td style="padding:10px 8px;text-align:right;font-size:15px;font-weight:700;color:#c9a96e;font-family:Georgia,serif;">${totalPrice.toFixed(2)} DT</td>
                </tr>
              </table>

              ${goldDivider()}

              <div style="background:#fef9ef;border:1px solid #e8d9b0;border-radius:8px;padding:14px 18px;font-size:13px;color:#7a6030;font-family:Georgia,serif;">
                💳 Paiement à la livraison &nbsp;|&nbsp; 📋 ID complet : <span style="font-family:'Courier New',monospace;font-size:11px;">${orderId}</span>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a1612;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#666;font-family:Georgia,serif;letter-spacing:0.04em;">
                ${BRAND_NAME} Admin · Notification automatique
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Public send function ────────────────────────────────────────────────────

export async function sendOrderEmails(params: SendOrderEmailsParams): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY not set — skipping order emails');
    return;
  }

  const shortId = params.orderId.slice(-8).toUpperCase();

  const [buyerResult, adminResult] = await Promise.allSettled([
    // Email to buyer
    resend.emails.send({
      from: `${BRAND_NAME} <${FROM_EMAIL}>`,
      to: params.buyerEmail,
      subject: `Confirmation de commande #${shortId} — ${BRAND_NAME}`,
      html: buildBuyerEmail(params),
    }),

    // Email to admin
    resend.emails.send({
      from: `${BRAND_NAME} <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `🛒 Nouvelle commande #${shortId} — ${params.totalPrice.toFixed(2)} DT`,
      html: buildAdminEmail(params),
    }),
  ]);

  if (buyerResult.status === 'rejected') {
    console.error('❌ Failed to send buyer email:', buyerResult.reason);
  } else {
    console.log('✅ Buyer confirmation email sent to:', params.buyerEmail);
  }

  if (adminResult.status === 'rejected') {
    console.error('❌ Failed to send admin email:', adminResult.reason);
  } else {
    console.log('✅ Admin notification email sent');
  }
}
