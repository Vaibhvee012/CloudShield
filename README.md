# CloudShield

**Cloud Security Posture Management (CSPM) Dashboard**

CloudShield is a cloud security monitoring platform designed to help users visualize cloud infrastructure, identify security risks, monitor security posture, and manage remediation actions from a centralized dashboard.

The project is being developed as a full-stack security-focused application using modern web technologies.

## Features

* Security posture dashboard
* Security score and environment health overview
* Cloud resource monitoring
* Security findings and risk tracking
* Critical, high, medium, and low severity classification
* Remediation action tracking
* AI security assistant interface
* Audit activity monitoring
* User authentication
* Role-based access control
* PostgreSQL database persistence
* Responsive cybersecurity-focused UI

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* TanStack Query
* Recharts
* Lucide React

### Backend

* Node.js
* Express.js
* TypeScript
* Prisma ORM
* PostgreSQL
* JWT Authentication
* bcrypt
* Helmet
* CORS

### Cloud & Security

* AWS SDK
* Cloud security posture monitoring
* Security rule evaluation
* Role-based access control
* Secure authentication

## Project Structure

```text
CloudShield/
│
├── Backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── prisma/
│   │   └── server.ts
│   ├── prisma/
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── App.tsx
│   └── package.json
│
└── README.md
```

## Dashboard

The CloudShield dashboard provides a centralized view of the cloud security environment, including:

* Overall security posture
* Security score
* Security findings
* Critical threats
* Cloud resources
* Resource health
* Security telemetry
* Cloud infrastructure visualization
* Remediation activity
* Recent security events

## Authentication

CloudShield uses JWT-based authentication for securing backend APIs.

User credentials are securely stored using password hashing with bcrypt, while protected API routes require a valid authentication token.

Role-based access control is also implemented to manage access to protected resources.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Vaibhvee012/CloudShield.git
cd CloudShield
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file:

```env
PORT=5000
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_jwt_secret"
```

Run the backend:

```bash
npm run dev
```

The API will run on:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd Frontend
npm install
npm run dev
```

The frontend will be available at the Vite development URL shown in t
