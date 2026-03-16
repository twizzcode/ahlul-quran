// @ts-expect-error - midtrans-client doesn't have types
import midtransClient from "midtrans-client";

// ============================================================
// Midtrans Configuration
// ============================================================

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

// Snap client for creating transactions
export const snap = new midtransClient.Snap({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

// Core API client for transaction status
export const coreApi = new midtransClient.CoreApi({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

// ============================================================
// Types
// ============================================================

export interface MidtransTransactionParams {
  orderId: string;
  amount: number;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  donationType: string;
  itemName?: string;
  enabledPayments?: string[];
}

export interface MidtransQrisTransactionResult {
  transactionId: string;
  qrCodeUrl: string;
  qrString: string;
  paymentType: string;
}

export interface MidtransNotification {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status?: string;
  currency: string;
}

export type DonationPaymentStatus =
  | "SUCCESS"
  | "PENDING"
  | "FAILED"
  | "EXPIRED"
  | "CHALLENGE"
  | "CANCELED";

// ============================================================
// Create Snap Transaction
// ============================================================

export async function createSnapTransaction(
  params: MidtransTransactionParams
) {
  const transactionDetails = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.amount,
    },
    customer_details: {
      first_name: params.donorName,
      email: params.donorEmail || undefined,
      phone: params.donorPhone || undefined,
    },
    item_details: [
      {
        id: params.orderId,
        price: params.amount,
        quantity: 1,
        name: params.itemName || `Donasi ${params.donationType}`,
      },
    ],
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_APP_URL}/donasi/status?order_id=${params.orderId}`,
    },
    enabled_payments: params.enabledPayments,
  };

  const transaction = await snap.createTransaction(transactionDetails);

  return {
    token: transaction.token as string,
    redirectUrl: transaction.redirect_url as string,
  };
}

export async function createQrisTransaction(params: MidtransTransactionParams) {
  const transaction = await coreApi.charge({
    payment_type: "qris",
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.amount,
    },
    customer_details: {
      first_name: params.donorName,
      email: params.donorEmail || undefined,
      phone: params.donorPhone || undefined,
    },
    item_details: [
      {
        id: params.orderId,
        price: params.amount,
        quantity: 1,
        name: params.itemName || `Donasi ${params.donationType}`,
      },
    ],
  });

  const qrCodeAction = Array.isArray(transaction.actions)
    ? transaction.actions.find((action: { name?: string }) => action.name === "generate-qr-code")
    : null;

  return {
    transactionId: String(transaction.transaction_id || ""),
    qrCodeUrl: String(qrCodeAction?.url || ""),
    qrString: String(transaction.qr_string || ""),
    paymentType: String(transaction.payment_type || "qris"),
  } satisfies MidtransQrisTransactionResult;
}

// ============================================================
// Verify Notification Signature
// ============================================================

export async function handleNotification(
  notificationJson: MidtransNotification
) {
  const notification = await snap.transaction.notification(notificationJson);

  const orderId = notification.order_id as string;
  const transactionStatus = notification.transaction_status as string;
  const fraudStatus = notification.fraud_status as string | undefined;
  const paymentType = notification.payment_type as string;
  const transactionId = notification.transaction_id as string;

  const status = mapMidtransTransactionStatus(transactionStatus, fraudStatus);

  return {
    orderId,
    transactionId,
    status,
    paymentType,
  };
}

// ============================================================
// Get Transaction Status
// ============================================================

export async function getTransactionStatus(orderId: string) {
  return coreApi.transaction.status(orderId);
}

export function mapMidtransTransactionStatus(
  transactionStatus: string,
  fraudStatus?: string
): DonationPaymentStatus {
  if (transactionStatus === "capture") {
    if (fraudStatus === "accept") {
      return "SUCCESS";
    }

    if (fraudStatus === "challenge") {
      return "CHALLENGE";
    }
  }

  if (transactionStatus === "settlement") {
    return "SUCCESS";
  }

  if (transactionStatus === "cancel") {
    return "CANCELED";
  }

  if (transactionStatus === "deny") {
    return "FAILED";
  }

  if (transactionStatus === "expire") {
    return "EXPIRED";
  }

  return "PENDING";
}

// ============================================================
// Helper: Generate Order ID
// ============================================================

export function generateOrderId(prefix: string = "DON"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
