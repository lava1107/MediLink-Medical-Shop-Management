import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";
import { JWT_SECRET } from "../config/env.js";
import { success, error } from "../utils/response.js";

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return error(res, "Please enter both username and password.", 400);
    }

    // Find user by username or email
    const users = await query(
      `SELECT u.id, u.name, u.username, u.email, u.password_hash, u.phone, u.status,
              r.name AS role, b.name AS branch, b.id AS branch_id
       FROM users u
       JOIN roles r ON u.role_id = r.id
       JOIN branches b ON u.branch_id = b.id
       WHERE LOWER(u.username) = LOWER(?) OR LOWER(u.email) = LOWER(?)`,
      [username, username]
    );

    if (users.length === 0) {
      return error(res, "No account found with that username or email.", 401);
    }

    const user = users[0];

    if (user.status !== "Active") {
      return error(res, "This account has been deactivated. Contact your administrator.", 403);
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return error(res, "Invalid credentials. Please check your password.", 401);
    }

    // Format last login timestamp
    const now = new Date();
    const lastLoginFormatted = now.toISOString().slice(0, 10) + " " + now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    await query("UPDATE users SET last_login = ? WHERE id = ?", [lastLoginFormatted, user.id]);

    const payload = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      branch: user.branch,
      branchId: user.branch_id,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    return success(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        branch: user.branch,
        branchId: user.branch_id,
        status: user.status,
        lastLogin: lastLoginFormatted,
      },
    }, "Login successful");
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const users = await query(
      `SELECT u.id, u.name, u.username, u.email, u.phone, u.status, u.last_login,
              r.name AS role, b.name AS branch, b.id AS branch_id
       FROM users u
       JOIN roles r ON u.role_id = r.id
       JOIN branches b ON u.branch_id = b.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return error(res, "User not found", 404);
    }

    const user = users[0];
    return success(res, {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      branch: user.branch,
      branchId: user.branch_id,
      status: user.status,
      lastLogin: user.last_login,
    });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  return success(res, null, "Logged out successfully");
}

export async function oauthLogin(req, res, next) {
  try {
    const { provider = "Google", email, name, avatar, role = "Admin" } = req.body;
    if (!email) {
      return error(res, "OAuth email is required", 400);
    }

    // Check if user exists by email
    let users = await query(
      `SELECT u.id, u.name, u.username, u.email, u.status,
              r.name AS role, b.name AS branch, b.id AS branch_id
       FROM users u
       JOIN roles r ON u.role_id = r.id
       JOIN branches b ON u.branch_id = b.id
       WHERE LOWER(u.email) = LOWER(?)`,
      [email]
    );

    let user;
    if (users.length > 0) {
      user = users[0];
    } else {
      // Find role_id
      const roles = await query(`SELECT id FROM roles WHERE name = ?`, [role]);
      const roleId = roles.length > 0 ? roles[0].id : 1;
      const branches = await query(`SELECT id, name FROM branches LIMIT 1`);
      const branchId = branches[0]?.id || "BR-01";
      const branchName = branches[0]?.name || "Kovilpatti Branch";
      const newId = `USR-OA-${Date.now().toString().slice(-4)}`;
      const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");

      await query(
        `INSERT INTO users (id, name, username, email, password_hash, phone, role_id, branch_id, status, last_login)
         VALUES (?, ?, ?, ?, 'OAUTH_EXTERNAL_USER', '+91 99999 00000', ?, ?, 'Active', NOW())`,
        [newId, name || "OAuth User", username, email, roleId, branchId]
      );

      user = {
        id: newId,
        name: name || "OAuth User",
        username,
        email,
        role,
        branch: branchName,
        branchId,
        status: "Active",
      };
    }

    const now = new Date();
    const lastLoginFormatted =
      now.toISOString().slice(0, 10) +
      " " +
      now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    await query("UPDATE users SET last_login = ? WHERE id = ?", [lastLoginFormatted, user.id]);

    const payload = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      branch: user.branch,
      branchId: user.branchId || user.branch_id,
      oauthProvider: provider,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    return success(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          branch: user.branch,
          branchId: user.branchId || user.branch_id,
          status: user.status || "Active",
          oauthProvider: provider,
          avatar: avatar || null,
          lastLogin: lastLoginFormatted,
        },
      },
      `Signed in via ${provider} OAuth successfully`
    );
  } catch (err) {
    next(err);
  }
}
