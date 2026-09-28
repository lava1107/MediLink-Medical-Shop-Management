# MediLink – Unified Multi-Branch Pharmacy Management System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![OAuth 2.0](https://img.shields.io/badge/Auth-OAuth_2.0_%26_JWT-blueviolet.svg)](#authentication)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

A modern full-stack multi-branch pharmacy and medical shop operations platform built with **React 18**, **Node.js (Express)**, **MySQL**, and **Tailwind CSS**. Unifies inventory, billing, batch expiry tracking, and inter-branch stock rebalancing across Kovilpatti, Tirunelveli, and Madurai.

---

## ✨ Key Mandatory Features

1. **OAuth 2.0 Authentication**: Seamless 1-click **Google Sign-In** and **GitHub Sign-In** issuing signed RFC 7519 cryptographic JWT sessions.
2. **JSON Web Token (JWT) Security**: HS256 signed bearer tokens with 7-day expiry, role claims, and automated API client injection (`Authorization: Bearer <token>`).
3. **7 Verified Active Test Accounts**: 1-click auto-fill credentials for 2 Admins and 5 Pharmacists across 3 branches.
4. **Dedicated System Administrator Console**: Executive command banner with network-wide KPIs, branch comparisons, and role permissions.
5. **Developer REST API Portal (`/api-access`)**: Production API Key management (`X-API-Key`) with interactive endpoint explorer, live response latency inspector, and code generators (cURL, JS, Python).
6. **MediBot AI Pharmacy Assistant**: Interactive floating widget providing live stock lookup, drug contraindication guidance, and workflow navigation.
7. **Recently Accessed Records**: Fast-access drawer in Navbar and dedicated Dashboard widget tracking visited medicines, customers, and branches.
8. **Multi-lingual (i18n) Support**: Instant reactive language switching between **English (EN)**, **Tamil (தமிழ் - TA)**, **Hindi (हिंदी - HI)**, and **Spanish (Español - ES)**.
9. **Authentic Pharmaceutical Data**: Real Indian medicines (Dolo 650, Augmentin 625 Duo, Pantocid 40, Glycomet 500, Shelcal 500, Human Mixtard Insulin, Ascoril LS, Betadine 10%), authentic manufacturers (Cipla, Sun Pharma, Micro Labs, GSK), GST slabs, and verified drug licenses.
10. **Standout Resume Defense Architecture**:
    - **Clinical Drug-Drug Interaction (DDI) Safety Engine**: Real-time algorithmic check during POS dispensing that prevents toxic duplicate active ingredients and dangerous antibiotic chelation with pharmacist clinical override gating.
    - **Inter-Branch Geo-Stock Transfer Matrix**: Live Haversine GPS distance calculation between Kovilpatti, Tirunelveli, Madurai and 5 partner medical shops.

---

## 🚀 Quick Start Guide

### 1. Backend REST API Setup (MySQL)
```bash
cd backend
npm install

# Initialize MySQL tables and realistic demo data
npm run db:setup

# Start backend server (Port 5000)
npm run dev
```

### 2. Frontend Web App Setup (React + Vite)
```bash
# In project root
npm install

# Start development server (Port 5173)
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🔑 Evaluator Test Accounts (7 Verified Logins)

| Role | Name | Username | Password | Branch |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Lavanya M | `lavanya.admin` | `admin123` | Kovilpatti Branch (HQ) |
| **Admin** | Dr. Sundar V | `sundar.admin` | `admin123` | Madurai Operations |
| **Pharmacist** | M. Rajan | `rajan.pharmacist` | `pharma123` | Kovilpatti Branch |
| **Pharmacist** | K. Meenakshi | `meenakshi.ph` | `pharma123` | Tirunelveli Branch |
| **Pharmacist** | P. Arun Kumar | `arunkumar.ph` | `pharma123` | Madurai Branch |
| **Pharmacist** | M. Divya | `divya.ph` | `pharma123` | Madurai Branch |
| **Pharmacist** | N. Bhuvaneshwari | `bhuvana.ph` | `pharma123` | Tirunelveli Branch |

*Tip: Click any user card under **EVALUATOR QUICK LOGIN** on `/login` to auto-authenticate with one click!*

---

## 📡 Developer REST API Endpoints

Pass `X-API-Key: ml_live_8f9a2b7c4e1d0f6a_2026` or `Authorization: Bearer <token>`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate with username & password |
| `POST` | `/api/auth/oauth` | Sign in with Google / GitHub OAuth profile |
| `GET` | `/api/medicines` | Query full pharmaceutical formulary & pricing |
| `GET` | `/api/availability` | Real-time cross-branch stock search |
| `GET` | `/api/partner-shops` | Registered external partner medical shops directory |
| `POST` | `/api/reservations` | Reserve emergency stock on behalf of a patient |

---

## 🛡️ Clinical Drug Interaction (DDI) Safety Engine

Implemented inside `src/services/drugSafetyEngine.js` and active in Point of Sale (`/sales`):
- **Duplicate Ingredient Detection**: Flags concomitant ingestion of multiple formulations sharing active generics (e.g., `Dolo 650` + `Crocin 650` = acute hepatotoxicity hazard).
- **Adverse Interaction Warning**: Flags combinations like `Paracetamol` + `Ibuprofen` (staggered dosing required) and `Azithromycin` + `PPIs` (pH chelation absorption hazard).
- **Gated Dispensing**: High-risk combinations require explicit **Pharmacist Clinical Counseling Override** before billing.

---

© 2026 MediLink Pharmacy Systems · Modern Web Technologies EL Project
