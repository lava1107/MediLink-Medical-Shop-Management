import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import {
  BRANCHES,
  CATEGORIES,
  SUPPLIERS,
  MEDICINES,
  BATCHES,
  CUSTOMERS,
  USERS,
  SALES,
  PURCHASES,
  RESERVATIONS,
  PARTNER_SHOPS,
  NOTIFICATIONS,
  PRESCRIPTIONS,
} from "../data/mockData.js";
import { loadJSON, saveJSON } from "../utils/storage.js";

export const AppContext = createContext(null);

const DB_KEY = "db_v1";
const NOTIFICATIONS_KEY = "notifications_v1";

const SEED_DB = {
  branches: BRANCHES,
  categories: CATEGORIES,
  suppliers: SUPPLIERS,
  medicines: MEDICINES,
  batches: BATCHES,
  customers: CUSTOMERS,
  users: USERS,
  sales: SALES,
  purchases: PURCHASES,
  reservations: RESERVATIONS,
  partnerShops: PARTNER_SHOPS,
  prescriptions: PRESCRIPTIONS,
};

// Holds the shared, in-memory "database" for the whole app (mock data today,
// API-fetched data later) plus notifications and a lightweight toast queue.
//
// PERSISTENCE: `db` and `notifications` are loaded from localStorage on first
// mount (lazy useState initializer, runs once) and written back on every
// change (effect below). If nothing is stored yet, the mock seed data is used
// and immediately saved -- existing stored data is never overwritten by the
// seed on a later reload, only read.
export function AppProvider({ children }) {
  const [db, setDb] = useState(() => loadJSON(DB_KEY, SEED_DB));
  const [notifications, setNotifications] = useState(() => loadJSON(NOTIFICATIONS_KEY, NOTIFICATIONS));
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    saveJSON(DB_KEY, db);
  }, [db]);

  useEffect(() => {
    saveJSON(NOTIFICATIONS_KEY, notifications);
  }, [notifications]);

  const toast = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  }, []);

  const value = useMemo(
    () => ({ db, setDb, notifications, setNotifications, markAllRead, toast, toasts }),
    [db, notifications, markAllRead, toast, toasts]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
