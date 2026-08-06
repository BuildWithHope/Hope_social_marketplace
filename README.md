# HopeSocial Marketplace — Full-Stack Monorepo

HopeSocial Marketplace is a premium full-stack application built with a **Next.js (JavaScript & JSX) Frontend** and a **Python & Django REST Framework Backend**.

## Project Structure

```text
social-hub-marketplace/
├── frontend/             <-- Next.js (JS/JSX) Web Application
│   ├── src/
│   └── package.json
├── backend/              <-- Python & Django REST API Server
│   ├── .venv/
│   ├── manage.py
│   ├── core/             <-- Django settings & URLs
│   ├── users/            <-- User Auth & Wallet Model
│   └── marketplace/      <-- Services, Accounts, Orders, Transactions
├── package.json          <-- Monorepo single-command dev script
├── .gitignore
└── README.md
```

## Quick Start (Single Command)

To run **both the Django Backend and Next.js Frontend together** in a single terminal:

```bash
npm run dev
```

- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://127.0.0.1:8000/`
- **Django Admin**: `http://127.0.0.1:8000/admin/`

## Individual Development Commands

If you prefer starting them individually:

### Start Frontend Only
```bash
npm run dev:frontend
```

### Start Backend Only
```bash
npm run dev:backend
```

## Single Git Push

Both `frontend/` and `backend/` are tracked together under a single Git repository:

```bash
git add .
git commit -m "Update full-stack application"
git push origin main
```
