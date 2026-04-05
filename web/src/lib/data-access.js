import {
  createPaymentSubmission,
  decidePayment,
  getDashboardByRole,
  getInvoiceById,
  listPendingPayments,
} from "@/lib/data-store";
import { isDatabaseConfigured } from "@/lib/db/client";
import {
  createPaymentSubmissionInDb,
  decidePaymentInDb,
  getDashboardByRoleFromDb,
  getInvoiceByIdFromDb,
  listPendingPaymentsFromDb,
} from "@/lib/db/dorm-repository";

function isTooManyConnectionsError(error) {
  const messages = [
    String(error?.message ?? "").toLowerCase(),
    String(error?.cause?.message ?? "").toLowerCase(),
    String(error?.sqlMessage ?? "").toLowerCase(),
  ];

  const mergedMessage = messages.join(" ");
  const code = String(error?.code ?? error?.cause?.code ?? "").toUpperCase();

  return (
    code === "ER_CON_COUNT_ERROR" ||
    mergedMessage.includes("too many connections") ||
    mergedMessage.includes("max_user_connections") ||
    mergedMessage.includes("resource")
  );
}

export async function getDashboardData(role, user) {
  if (!isDatabaseConfigured()) {
    return getDashboardByRole(role, user);
  }

  try {
    return await getDashboardByRoleFromDb(role, user);
  } catch (error) {
    if (!isTooManyConnectionsError(error)) {
      throw error;
    }

    return getDashboardByRole(role, user);
  }
}

export async function getInvoiceDataById(invoiceId) {
  if (!isDatabaseConfigured()) {
    return getInvoiceById(invoiceId);
  }

  try {
    return await getInvoiceByIdFromDb(invoiceId);
  } catch (error) {
    if (!isTooManyConnectionsError(error)) {
      throw error;
    }

    return getInvoiceById(invoiceId);
  }
}

export async function createPaymentSubmissionData(payload, user) {
  if (!isDatabaseConfigured()) {
    return createPaymentSubmission(payload, user);
  }

  try {
    return await createPaymentSubmissionInDb(payload, user);
  } catch (error) {
    if (!isTooManyConnectionsError(error)) {
      throw error;
    }

    return createPaymentSubmission(payload, user);
  }
}

export async function listPendingPaymentsData() {
  if (!isDatabaseConfigured()) {
    return listPendingPayments();
  }

  try {
    return await listPendingPaymentsFromDb();
  } catch (error) {
    if (!isTooManyConnectionsError(error)) {
      throw error;
    }

    return listPendingPayments();
  }
}

export async function decidePaymentData(paymentId, status, reviewerId, rejectReason = "") {
  if (!isDatabaseConfigured()) {
    return decidePayment(paymentId, status, reviewerId, rejectReason);
  }

  try {
    return await decidePaymentInDb(paymentId, status, reviewerId, rejectReason);
  } catch (error) {
    if (!isTooManyConnectionsError(error)) {
      throw error;
    }

    return decidePayment(paymentId, status, reviewerId, rejectReason);
  }
}
