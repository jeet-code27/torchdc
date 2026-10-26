import nodemailer from "nodemailer";
import { IOrder } from "@/models/Order";
import { orderLabel } from "@/lib/orders/display";
import { buildOrderEmail } from "@/lib/orders/order-email";
import type { OrderForAlert } from "@/lib/push/order-alerts";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

// Outgoing SMTP Authenticated Sender (Brevo verified sender)
const FROM_EMAIL =
  process.env.EMAIL_FROM || '"Torch" <torchdc0@gmail.com>';

// Official Customer-Facing Reply-To Email
const PUBLIC_REPLY_TO = process.env.EMAIL_REPLY_TO || "info@torchdc.co";

// Store owner's inbox: every admin notification (new orders) always goes here
const STORE_NOTIFY_EMAIL = "torchdc@icloud.com";

// Admin notification recipients: the store inbox plus any extra addresses in ADMIN_EMAIL (comma separated)
const ADMIN_RECIPIENTS = Array.from(
  new Set(
    [STORE_NOTIFY_EMAIL, ...(process.env.ADMIN_EMAIL || "").split(",")]
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  )
);

// Public site URL for links inside emails (Vercel sets VERCEL_PROJECT_PRODUCTION_URL to the production domain)
const SITE_URL = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://torchdc.co")
).replace(/\/$/, "");

/** Escape customer-entered text before putting it into email HTML. */
function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Official Torch Black Logo Hosted URL
const TORCH_LOGO_URL =
  "https://res.cloudinary.com/omtao1np/image/upload/v1791542187/torch/branding/hwfwtj7tje0q7d6jn8sp.png";

// Brand Green Color Constant
const BRAND_GREEN = "#5A805B";

/**
 * Sends order confirmation receipt to the customer
 */
export async function sendOrderConfirmationEmail(order: IOrder) {
  try {
    // Email is optional at checkout; nothing to send without one
    if (!order.customer.email) {
      return { success: true, skipped: true };
    }
    const transporter = getTransporter();
    if (!transporter) {
      console.log(
        `[Email Simulation] SMTP not configured. Order confirmation for ${order.orderNumber} to ${order.customer.email}`
      );
      return { success: true, simulated: true };
    }

    const itemsHtml = order.items
      .map(
        (it) => `
        <tr style="border-bottom: 1px solid #edf2ed;">
          <td style="padding: 12px 8px; font-weight: bold; color: #1f2937;">
            ${it.name} ${it.weight ? `<span style="color: #6b7280; font-size: 12px; font-weight: normal;">(${it.weight})</span>` : ""}
          </td>
          <td style="padding: 12px 8px; text-align: center; color: #4b5563;">
            ${it.quantity}
          </td>
          <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #111827;">
            $${(it.price * it.quantity).toFixed(2)}
          </td>
        </tr>
      `
      )
      .join("");

    const fulfillmentText =
      order.fulfillment === "delivery"
        ? `🚚 Delivery to: <strong>${order.deliveryAddress?.street || ""}${order.deliveryAddress?.apartment ? `, Apt ${order.deliveryAddress.apartment}` : ""}, ${order.deliveryAddress?.city || "Washington"}, DC ${order.deliveryAddress?.zip || "20005"}</strong>`
        : `🏪 Counter Pickup at: <strong>1000 G St NW, Washington, DC 20001</strong>`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <!-- Header with Original Black Logo on Clean White Background with #5A805B accent line -->
        <div style="background: #ffffff; border-bottom: 3px solid ${BRAND_GREEN}; padding: 28px 24px; text-align: center;">
          <img src="${TORCH_LOGO_URL}" alt="TORCH" style="height: 44px; max-width: 190px; margin: 0 auto 10px; display: block; border: 0;" />
          <h1 style="margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 0.5px; color: #111827;">ORDER CONFIRMED</h1>
          <p style="margin: 4px 0 0; font-size: 13px; font-weight: 600; color: ${BRAND_GREEN};">${orderLabel(order.orderNumber)}</p>
        </div>

        <div style="padding: 28px 24px;">
          <p style="font-size: 15px; color: #374151; margin-top: 0; line-height: 1.5;">
            Hi <strong>${order.customer.name}</strong>, thank you for ordering with <strong>Torch</strong>! We've received your order and our staff is currently preparing it for you.
          </p>

          <!-- Fulfillment Info Box -->
          <div style="background: #f7f9f7; border: 1px solid #e2ebe3; border-radius: 12px; padding: 16px; margin: 22px 0; font-size: 13px; color: #1f2937;">
            <div style="font-size: 14px; line-height: 1.4;">${fulfillmentText}</div>
            <div style="margin-top: 8px; font-size: 12px; color: ${BRAND_GREEN}; font-weight: 600;">
              ⏱ Estimated Time: <strong>35 to 60 Minutes</strong> · Cash on ${order.fulfillment === "delivery" ? "Delivery" : "Pickup"}
            </div>
            ${order.deliveryNotes ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #64748b; font-style: italic;">Notes: "${order.deliveryNotes}"</div>` : ""}
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;">
            <thead>
              <tr style="border-bottom: 2px solid ${BRAND_GREEN}; color: ${BRAND_GREEN}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                <th style="padding: 8px 4px; text-align: left;">Item</th>
                <th style="padding: 8px 4px; text-align: center;">Qty</th>
                <th style="padding: 8px 4px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px 4px 4px; text-align: right; color: #6b7280; font-size: 13px;">Subtotal:</td>
                <td style="padding: 10px 4px 4px; text-align: right; font-weight: 600; color: #111827;">$${order.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 4px; text-align: right; color: #6b7280; font-size: 13px;">DC Metro Delivery:</td>
                <td style="padding: 4px; text-align: right; font-weight: bold; color: ${BRAND_GREEN};">FREE</td>
              </tr>
              <tr style="border-top: 2px solid #111827;">
                <td colspan="2" style="padding: 12px 4px; text-align: right; font-size: 15px; font-weight: 900; color: #111827;">Total Due:</td>
                <td style="padding: 12px 4px; text-align: right; font-size: 18px; font-weight: 900; color: ${BRAND_GREEN};">$${order.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Compliance Notice -->
          <div style="background-color: #f7f9f7; border: 1px solid #e2ebe3; border-radius: 8px; padding: 12px; margin: 20px 0; text-align: center; font-size: 12px; color: ${BRAND_GREEN}; font-weight: 500;">
            🌿 <strong>21+ Valid ID Required</strong> · Please have your government-issued photo ID ready at the door.
          </div>

          <!-- Professional Footer with info@torchdc.co -->
          <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #f3f4f6; font-size: 12px; color: #6b7280; text-align: center; line-height: 1.6;">
            <p style="margin: 0;">
              Have questions about your order? Reply directly to this email or reach us at <a href="mailto:${PUBLIC_REPLY_TO}" style="color: ${BRAND_GREEN}; font-weight: 700; text-decoration: none;">${PUBLIC_REPLY_TO}</a>
            </p>
            <p style="margin: 6px 0 0; color: #9ca3af; font-size: 11px;">
              Torch Dispensary · 1000 G St NW, Washington, DC 20001 · <a href="https://torchdc.co" style="color: ${BRAND_GREEN}; text-decoration: none;">torchdc.co</a>
            </p>
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: order.customer.email,
      replyTo: PUBLIC_REPLY_TO,
      subject: `Order ${orderLabel(order.orderNumber)} Confirmed | Torch`,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send customer order confirmation email:", error);
    return { success: false, error };
  }
}

/**
 * New order alert to the store (admin update v3 design: order #, first name, item count, ZIP, cash,
 * note and an "Open order to confirm" button; no product names, same as push alerts).
 * kind "reminder" is the "Still waiting" email sent when an order is still pending after 5 minutes.
 */
export async function sendAdminNewOrderNotification(order: IOrder | OrderForAlert, kind: "new" | "reminder" = "new") {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.log(`[Email Simulation] Admin ${kind} order alert for ${orderLabel(order.orderNumber)} ($${order.total})`);
      return { success: true, simulated: true };
    }

    const alertOrder: OrderForAlert = { ...(order as OrderForAlert), orderNumber: orderLabel(order.orderNumber) };
    const { subject, html, text } = buildOrderEmail(alertOrder, kind, SITE_URL);
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: ADMIN_RECIPIENTS.join(", "),
      subject,
      html,
      text,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send admin order alert email:", error);
    return { success: false, error };
  }
}
