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
import { api } from "../services/api.js";

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
  partnerAvailability: [],
  prescriptions: PRESCRIPTIONS,
};

export function AppProvider({ children }) {
  const [db, setDb] = useState(() => loadJSON(DB_KEY, SEED_DB));
  const [notifications, setNotifications] = useState(() => loadJSON(NOTIFICATIONS_KEY, NOTIFICATIONS));
  const [toasts, setToasts] = useState([]);
  const [backendConnected, setBackendConnected] = useState(false);

  // Sync to local cache for instant offline rendering
  useEffect(() => {
    saveJSON(DB_KEY, db);
  }, [db]);

  useEffect(() => {
    saveJSON(NOTIFICATIONS_KEY, notifications);
  }, [notifications]);

  // Fetch full synchronized state from MySQL backend
  const refreshDb = useCallback(async () => {
    try {
      const data = await api.get("/bootstrap");
      if (data && data.medicines) {
        setDb((prev) => ({
          ...prev,
          branches: data.branches || prev.branches,
          categories: data.categories || prev.categories,
          suppliers: data.suppliers || prev.suppliers,
          medicines: data.medicines || prev.medicines,
          batches: data.batches || prev.batches,
          customers: data.customers || prev.customers,
          users: data.users || prev.users,
          sales: data.sales || prev.sales,
          purchases: data.purchases || prev.purchases,
          reservations: data.reservations || prev.reservations,
          partnerShops: data.partnerShops || prev.partnerShops,
          partnerAvailability: data.partnerAvailability || prev.partnerAvailability,
          prescriptions: data.prescriptions || prev.prescriptions,
        }));
        if (data.notifications) {
          setNotifications(data.notifications);
        }
        setBackendConnected(true);
      }
    } catch (err) {
      console.warn("[MediLink] Backend sync notice:", err.message);
      setBackendConnected(false);
    }
  }, []);

  // Initial load from backend on mount and automatic live sync every 3 seconds
  useEffect(() => {
    refreshDb();
    const interval = setInterval(() => {
      refreshDb();
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshDb]);

  const toast = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
    try {
      await api.patch("/notifications/read-all");
    } catch {
      // Local state already updated
    }
  }, []);

  const value = useMemo(
    () => ({
      db,
      setDb,
      notifications,
      setNotifications,
      markAllRead,
      toast,
      toasts,
      refreshDb,
      backendConnected,
    }),
    [db, notifications, markAllRead, toast, toasts, refreshDb, backendConnected]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
