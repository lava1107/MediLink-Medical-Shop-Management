import { query } from "../config/db.js";
import { success, error } from "../utils/response.js";

export async function getAll(req, res, next) {
  try {
    const { branch, status } = req.query;
    let sql = `
      SELECT r.id, r.customer_name AS customer, r.customer_id AS customerId,
             r.medicine_name AS medicine, r.medicine_id AS medicineId,
             r.branch_name AS branch, r.branch_id AS branchId,
             r.quantity,
             DATE_FORMAT(r.res_date, '%Y-%m-%d') AS resDate,
             DATE_FORMAT(r.expiry, '%Y-%m-%d') AS expiry,
             r.status, r.created_by AS createdBy
      FROM reservations r
    `;

    const params = [];
    const conditions = [];

    if (branch) {
      conditions.push("(r.branch_name = ? OR r.branch_id = ?)");
      params.push(branch, branch);
    }
    if (status) {
      conditions.push("r.status = ?");
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY r.res_date DESC, r.id DESC";

    const reservations = await query(sql, params);
    return success(res, reservations);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const rows = await query(
      `SELECT r.id, r.customer_name AS customer, r.customer_id AS customerId,
              r.medicine_name AS medicine, r.medicine_id AS medicineId,
              r.branch_name AS branch, r.branch_id AS branchId,
              r.quantity,
              DATE_FORMAT(r.res_date, '%Y-%m-%d') AS resDate,
              DATE_FORMAT(r.expiry, '%Y-%m-%d') AS expiry,
              r.status, r.created_by AS createdBy
       FROM reservations r
       WHERE r.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return error(res, "Reservation not found", 404);
    }

    return success(res, rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { customer, medicine, branch, quantity, expiry, createdBy } = req.body;
    if (!customer || !medicine || !branch) {
      return error(res, "Customer, medicine, and branch are required.", 400);
    }

    // Resolve customer
    let customerId = null;
    const custRows = await query("SELECT id FROM customers WHERE LOWER(name) = LOWER(?)", [customer]);
    if (custRows.length > 0) customerId = custRows[0].id;

    // Resolve medicine
    let medicineId = null;
    const medRows = await query("SELECT id FROM medicines WHERE LOWER(name) = LOWER(?)", [medicine]);
    if (medRows.length > 0) medicineId = medRows[0].id;

    // Resolve branch
    let branchId = "BR-01";
    let branchName = branch;
    const branchRows = await query("SELECT id, name FROM branches WHERE LOWER(name) = LOWER(?) OR id = ?", [branch, branch]);
    if (branchRows.length > 0) {
      branchId = branchRows[0].id;
      branchName = branchRows[0].name;
    }

    const countResult = await query("SELECT COUNT(*) as cnt FROM reservations");
    const newId = `RSV-${String(countResult[0].cnt + 1).padStart(2, "0")}`;
    const today = new Date().toISOString().slice(0, 10);
    const expiryDate = expiry || new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

    await query(
      `INSERT INTO reservations (id, customer_id, customer_name, medicine_id, medicine_name, branch_id, branch_name, quantity, res_date, expiry, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        customerId,
        customer,
        medicineId,
        medicine,
        branchId,
        branchName,
        Number(quantity) || 1,
        today,
        expiryDate,
        "Pending",
        createdBy || "Pharmacist",
      ]
    );

    // Create Notification
    const notifCount = await query("SELECT COUNT(*) as cnt FROM notifications");
    const notifId = `N${notifCount[0].cnt + 1}`;
    await query(
      `INSERT INTO notifications (id, type, title, \`desc\`, time, \`read\`, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        notifId,
        "Reservation Created",
        `New reservation: ${newId}`,
        `${customer} reserved ${medicine} (${quantity || 1} units).`,
        new Date().toISOString().slice(0, 10) + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        0,
        branchId,
      ]
    );

    const [created] = await query(
      `SELECT r.id, r.customer_name AS customer, r.customer_id AS customerId,
              r.medicine_name AS medicine, r.medicine_id AS medicineId,
              r.branch_name AS branch, r.branch_id AS branchId,
              r.quantity,
              DATE_FORMAT(r.res_date, '%Y-%m-%d') AS resDate,
              DATE_FORMAT(r.expiry, '%Y-%m-%d') AS expiry,
              r.status, r.created_by AS createdBy
       FROM reservations r
       WHERE r.id = ?`,
      [newId]
    );

    return success(res, created, "Reservation created successfully", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { action, status } = req.body;

    let newStatus = status;
    if (action === "confirm") newStatus = "Reserved";
    if (action === "collect") newStatus = "Collected";
    if (action === "cancel") newStatus = "Cancelled";

    if (!newStatus) {
      return error(res, "Action or new status is required.", 400);
    }

    const existing = await query("SELECT * FROM reservations WHERE id = ?", [id]);
    if (existing.length === 0) {
      return error(res, "Reservation not found", 404);
    }

    await query("UPDATE reservations SET status = ? WHERE id = ?", [newStatus, id]);

    const [updated] = await query(
      `SELECT r.id, r.customer_name AS customer, r.customer_id AS customerId,
              r.medicine_name AS medicine, r.medicine_id AS medicineId,
              r.branch_name AS branch, r.branch_id AS branchId,
              r.quantity,
              DATE_FORMAT(r.res_date, '%Y-%m-%d') AS resDate,
              DATE_FORMAT(r.expiry, '%Y-%m-%d') AS expiry,
              r.status, r.created_by AS createdBy
       FROM reservations r
       WHERE r.id = ?`,
      [id]
    );

    return success(res, updated, `Reservation status updated to ${newStatus}`);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { customer, medicine, branch, quantity, expiry, status } = req.body;

    const existing = await query("SELECT * FROM reservations WHERE id = ?", [id]);
    if (existing.length === 0) {
      return error(res, "Reservation not found", 404);
    }

    await query(
      `UPDATE reservations
       SET customer_name = COALESCE(?, customer_name),
           medicine_name = COALESCE(?, medicine_name),
           branch_name = COALESCE(?, branch_name),
           quantity = COALESCE(?, quantity),
           expiry = COALESCE(?, expiry),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [
        customer ?? null,
        medicine ?? null,
        branch ?? null,
        quantity !== undefined ? Number(quantity) : null,
        expiry ?? null,
        status ?? null,
        id,
      ]
    );

    const [updated] = await query(
      `SELECT r.id, r.customer_name AS customer, r.customer_id AS customerId,
              r.medicine_name AS medicine, r.medicine_id AS medicineId,
              r.branch_name AS branch, r.branch_id AS branchId,
              r.quantity,
              DATE_FORMAT(r.res_date, '%Y-%m-%d') AS resDate,
              DATE_FORMAT(r.expiry, '%Y-%m-%d') AS expiry,
              r.status, r.created_by AS createdBy
       FROM reservations r
       WHERE r.id = ?`,
      [id]
    );

    return success(res, updated, "Reservation updated successfully");
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await query("DELETE FROM reservations WHERE id = ?", [id]);
    return success(res, { id }, "Reservation deleted successfully");
  } catch (err) {
    next(err);
  }
}

