
# Restaurant Admin Web App

![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)

## 🚀 Introduction
A modern **SaaS-ready restaurant management frontend** built for speed, scalability, and simplicity.
This web application connects seamlessly with the [Restaurant Backend](https://github.com/oldcrux/restaurant_server) and [Voice AI Agent](https://github.com/oldcrux/restaurant_ai_voice_agent) to deliver a full-stack experience where:

- Customers can place pickup orders or book appointments effortlessly.
- Staff can manage menus, orders, and reservations in real time.
- Organizations can run multiple stores under a single account.

Built with **production-grade best practices**, this frontend is designed for restaurants of any size — from small local cafés to multi-branch chains — while being **AI-ready** out of the box.


## 🛠️ Tech Stack
- Nextjs
- SuperTokens (authentication)
- shadcn/ui (components)
- TailwindCSS (styling)
- FullCalendar (calendar)
- Docker (containerization)


## 🏗️ Architecture
![architecture](https://raw.githubusercontent.com/oldcrux/restaurant_server/main/docs/architecture.png)


[Admin portal documentation](https://docs.google.com/document/d/1c0gday3HUYGxR-Y2_FMXSONcqkIePGpkOb6J_bGsrYU/edit?usp=sharing)

Components:
- **Backend API** – Order & appointment lifecycle management.
- **Auth (SuperTokens)** – Secure user + bot authentication.
- **PostgreSQL** – Data persistence.
- **Voice AI Agent** – Calls backend APIs using short-lived bot tokens.
- **Frontend** – Management & customer-facing UI.


## ✨ Features
- Multi-organization & multi-store support.
- Role-based user management.
- Store-specific & global menu items.
- Full order lifecycle (CREATED → DELIVERED).
- Appointment booking lifecycle.
- Secure API access for bot users.  

### watch order lifecycle
[Order Lifecycle](https://youtu.be/7WvWq5NbZJs)

### watch appointment lifecycle
[Appointment Lifecycle](https://youtu.be/0Zo49_BSgT4)

## Application Setup and Execution

### Prerequisite
- docker
- nodejs >= 18.0.0
- npm
- backend application setup.  Follow [README](https://github.com/oldcrux/restaurant_server/blob/main/README.md) file.


### Environment variables
```bash
NEXT_PUBLIC_LOCALHOST_URL=http://localhost:3000

# Backend server URL
NEXT_PUBLIC_NODE_SERVER_URL=http://localhost:4000

# For production. This is needed to redirect the user to registration form. Can be ignored for local development and testing..
NEXT_PUBLIC_WEBSITE=

# For Google social login
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Bring up the application
```bash
npm install
npm run dev
```

Server is available at `http://localhost:3000`

## Production

1. Build the project:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

### 🚀 Docker Build and Push for Production Deployment
```bash
npm run build
docker build --no-cache --platform linux/amd64 -t <your repo> .
docker push <your repo>
```

## 📌 TODOs
- Structured logging (pino/winston)
- Social Login
- Dashboard implementation