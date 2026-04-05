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

export async function getDashboardData(role, user) {
  if (!isDatabaseConfigured()) {
    return getDashboardByRole(role, user);
  }

  return getDashboardByRoleFromDb(role, user);
}

export async function getInvoiceDataById(invoiceId) {
  if (!isDatabaseConfigured()) {
    return getInvoiceById(invoiceId);
  }

  return getInvoiceByIdFromDb(invoiceId);
}

export async function createPaymentSubmissionData(payload, user) {
  if (!isDatabaseConfigured()) {
    return createPaymentSubmission(payload, user);
  }

  return createPaymentSubmissionInDb(payload, user);
}

export async function listPendingPaymentsData() {
  if (!isDatabaseConfigured()) {
    return listPendingPayments();
  }

  return listPendingPaymentsFromDb();
}

export async function decidePaymentData(paymentId, status, reviewerId, rejectReason = "") {
  if (!isDatabaseConfigured()) {
    return decidePayment(paymentId, status, reviewerId, rejectReason);
  }

  return decidePaymentInDb(paymentId, status, reviewerId, rejectReason);
}
