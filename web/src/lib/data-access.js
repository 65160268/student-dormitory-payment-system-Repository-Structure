import {
  addAuditLog,
  createMaintenanceRequest,
  createPaymentSubmission,
  decidePayment,
  getDashboardByRole,
  getInvoiceById,
  getRoomRates,
  listAuditLogs,
  listMaintenanceRequests,
  listPendingPayments,
  saveMeterReading,
  updateMaintenanceStatus,
  updateRoomRates,
} from "@/lib/data-store";
import { isDatabaseConfigured } from "@/lib/db/client";
import {
  addAuditLogInDb,
  createMaintenanceRequestInDb,
  createPaymentSubmissionInDb,
  decidePaymentInDb,
  getDashboardByRoleFromDb,
  getInvoiceByIdFromDb,
  getRoomRatesFromDb,
  listAuditLogsFromDb,
  listMaintenanceRequestsFromDb,
  listPendingPaymentsFromDb,
  saveMeterReadingInDb,
  updateMaintenanceStatusInDb,
  updateRoomRatesInDb,
  upsertInvoiceFromMeterReadingInDb,
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

export async function saveMeterReadingData(payload, user) {
  if (!isDatabaseConfigured()) {
    return saveMeterReading(payload, user);
  }

  try {
    return await saveMeterReadingInDb(payload, user);
  } catch (error) {
    if (!isTooManyConnectionsError(error)) {
      throw error;
    }

    return saveMeterReading(payload, user);
  }
}

export async function upsertInvoiceFromMeterReadingData(reading) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    return await upsertInvoiceFromMeterReadingInDb(reading);
  } catch (error) {
    if (!isTooManyConnectionsError(error)) {
      throw error;
    }

    return null;
  }
}

export async function getRoomRatesData() {
  if (!isDatabaseConfigured()) {
    return getRoomRates();
  }

  try {
    return await getRoomRatesFromDb();
  } catch (error) {
    if (!isTooManyConnectionsError(error)) {
      throw error;
    }

    return getRoomRates();
  }
}

export async function updateRoomRatesData(waterPerUnit, electricPerUnit, updatedBy) {
  if (!isDatabaseConfigured()) {
    return updateRoomRates(waterPerUnit, electricPerUnit);
  }

  try {
    return await updateRoomRatesInDb(waterPerUnit, electricPerUnit, updatedBy);
  } catch (error) {
    if (!isTooManyConnectionsError(error)) {
      throw error;
    }

    return updateRoomRates(waterPerUnit, electricPerUnit);
  }
}

export async function addAuditLogData(actorId, action, targetType, targetId, detail) {
  if (!isDatabaseConfigured()) {
    return addAuditLog(actorId, action, targetType, targetId, detail);
  }

  try {
    return await addAuditLogInDb(actorId, action, targetType, targetId, detail);
  } catch (error) {
    if (!isTooManyConnectionsError(error)) {
      throw error;
    }

    return addAuditLog(actorId, action, targetType, targetId, detail);
  }
}

export async function listAuditLogsData(limit = 50) {
  if (!isDatabaseConfigured()) {
    return listAuditLogs(limit);
  }

  try {
    return await listAuditLogsFromDb(limit);
  } catch (error) {
    if (!isTooManyConnectionsError(error)) {
      throw error;
    }

    return listAuditLogs(limit);
  }
}

export async function listMaintenanceRequestsData(filterStudentId = null) {
  if (!isDatabaseConfigured()) {
    return listMaintenanceRequests(filterStudentId);
  }

  try {
    return await listMaintenanceRequestsFromDb(filterStudentId);
  } catch (error) {
    if (!isTooManyConnectionsError(error)) {
      throw error;
    }

    return listMaintenanceRequests(filterStudentId);
  }
}

export async function createMaintenanceRequestData(payload) {
  if (!isDatabaseConfigured()) {
    return createMaintenanceRequest(payload);
  }

  try {
    return await createMaintenanceRequestInDb(payload);
  } catch (error) {
    if (!isTooManyConnectionsError(error)) {
      throw error;
    }

    return createMaintenanceRequest(payload);
  }
}

export async function updateMaintenanceStatusData(id, status, staffId = null) {
  if (!isDatabaseConfigured()) {
    return updateMaintenanceStatus(id, status, staffId);
  }

  try {
    return await updateMaintenanceStatusInDb(id, status, staffId);
  } catch (error) {
    if (!isTooManyConnectionsError(error)) {
      throw error;
    }

    return updateMaintenanceStatus(id, status, staffId);
  }
}
