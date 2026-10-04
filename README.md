# CloudShield

CloudShield is a Cloud Security Posture Management (CSPM) platform designed to provide centralized visibility into cloud infrastructure, identify security risks, evaluate security posture, and assist with remediation.

The project combines AWS resource discovery, security scanning, risk prioritization, remediation workflows, and Generative AI to provide a unified security dashboard for cloud environments.

## Overview

Managing cloud infrastructure becomes increasingly difficult as the number of resources and services grows. Misconfigured storage, excessive permissions, exposed services, missing logging, and other configuration issues can introduce significant security risks.

CloudShield addresses this problem by continuously organizing cloud resources and security findings into a centralized platform.

The platform provides:

- AWS resource discovery and monitoring
- Security findings and severity classification
- Security posture scoring
- Risk prioritization
- Remediation tracking
- AI-powered security analysis
- AI-generated finding explanations
- AI-assisted remediation recommendations
- Authentication and role-based access control
- Security activity and audit-oriented views

## Key Features

### Cloud Infrastructure Visibility

CloudShield provides a centralized view of discovered AWS resources, including services such as:

- EC2
- S3
- RDS

Resources are organized by service, region, environment, status, risk level, and source.

### Security Posture

The dashboard provides an overall security posture score based on the current security findings and resource health.

The security dashboard presents:

- Overall security score
- Resource health
- Security findings
- Severity distribution
- Security activity
- Infrastructure visualization
- AI-generated security insights

### Security Findings

CloudShield identifies security issues across discovered resources and classifies them according to severity.

Supported severity levels include:

- Critical
- High
- Medium
- Low

Each finding contains information such as:

- Finding title
- Description
- Affected resource
- Resource type
- Region
- Security category
- Severity
- Current status

### Risk Prioritization

The platform helps prioritize security issues based on factors such as:

- Severity
- Resource exposure
- Potential data exposure
- Unauthorized access risk
- Internet exposure
- Privilege escalation
- Attack surface

This allows users to focus on the highest-impact security issues first.

### Remediation Management

CloudShield provides remediation tracking for security findings.

Remediation workflows can include:

- Recommended action
- Remediation status
- Security improvement
- Verification steps
- Remediation history

The platform is designed to provide guidance rather than automatically making potentially destructive infrastructure changes.

### CloudShield AI

CloudShield integrates Google Gemini to provide AI-assisted security analysis.

The AI layer can:

- Answer questions about the cloud security environment
- Explain individual security findings
- Prioritize security risks
- Generate remediation recommendations
- Provide dashboard-level security insights

The AI operates using CloudShield security context such as resources, findings, remediation actions, and security posture.

AI responses are advisory and are not presented as proof that an AWS configuration has been modified.

### Authentication and RBAC

CloudShield includes authentication and role-based access control.

The backend provides:

- User registration
- User login
- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- Role-based authorization

Authentication tokens are used to protect application APIs and user-specific operations.

## Architecture

CloudShield follows a modular frontend/backend architecture.

```text
                        CloudShield
                            |
              +-------------+-------------+
              |                           |
          Frontend                    Backend API
              |                           |
      React + TypeScript            Node + Express
              |                           |
      React Router / UI             Controllers
      TanStack Query                Services
      Recharts                      Middleware
              |                           |
              +-------------+-------------+
                            |
                         Prisma
                            |
                       PostgreSQL
                            |
                    CloudShield Data
                            |
                    +-------+-------+
                    |               |
                  AWS            Gemini
               Integration         AI
```

## Application Flow

The general CloudShield workflow is:

```text
AWS Infrastructure
       |
       v
AWS Resource Discovery
       |
       v
Resource Persistence
       |
       v
Security Scanning
       |
       v
Security Findings
       |
       +-------------------+
       |                   |
       v                   v
Security Score       Risk Prioritization
       |                   |
       +---------+---------+
                 |
                 v
          Remediation
                 |
                 v
          CloudShield AI
```

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Recharts
- Lucide React

### Backend

- Node.js
- Express.js
- TypeScript
- Zod
- JWT
- bcrypt
- Helmet
- CORS
- Pino

### Database

- PostgreSQL
- Prisma ORM

### Cloud

- Amazon Web Services
- AWS SDK
- AWS resource discovery and security scanning

### AI

- Google Gemini API
- Generative AI-powered security analysis

### Development

- Git
- GitHub
- ESLint

## Project Structure

```text
CloudShield/
|
├── Backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── lib/
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   └── package.json
|
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── package.json
|
└── README.md
```

## Backend API

CloudShield exposes REST APIs for its core functionality.

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Security

```text
GET /api/security
```

Returns the current security posture and security metrics.

### Resources

```text
GET /api/resources
GET /api/aws/resources
```

Provides CloudShield resources and AWS-discovered resources.

### Findings

```text
GET /api/findings
```

Returns security findings identified by the platform.

### Remediation

```text
GET /api/remediation
```

Returns remediation actions and their current status.

### AWS Integration

```text
POST /api/aws/full-sync
GET  /api/aws/sync-status
GET  /api/aws/resources
```

These endpoints support AWS resource synchronization and monitoring.

### AI

```text
GET  /api/ai/dashboard/insight
POST /api/ai/chat
POST /api/ai/findings/:id/explain
POST /api/ai/risks/prioritize
POST /api/ai/findings/:id/remediation
```

The AI endpoints provide security analysis, finding explanations, risk prioritization, remediation recommendations, and dashboard insights.

## Database Design

CloudShield uses PostgreSQL with Prisma ORM.

The core data model includes entities such as:

```text
User
 |
 +-- Resource
 |
 +-- Finding
 |
 +-- RemediationAction
```

Resources represent discovered infrastructure.

Findings represent security issues associated with resources.

Remediation actions track the recommended or performed remediation workflow associated with findings.

The architecture is designed to support further expansion toward account-level AWS connections and multi-tenant resource isolation.

## Security Design

Security is considered throughout the application architecture.

CloudShield uses:

- JWT authentication
- bcrypt password hashing
- Protected API routes
- Role-based authorization
- Helmet security middleware
- CORS configuration
- Input validation
- Environment variables for secrets
- Server-side authorization
- Advisory-only AI remediation guidance

Sensitive credentials and API keys should be stored through environment variables and should never be committed to the repository.

## AWS Integration

CloudShield is designed to analyze AWS infrastructure through programmatic AWS access.

During development, the platform is connected to an AWS environment used for resource discovery and security testing.

The long-term architecture is designed around allowing individual users to connect their own AWS environments rather than sharing credentials belonging to the project owner.

A production implementation can use AWS IAM roles and temporary credentials to provide controlled, least-privilege access to a user's AWS account.

## AI Security Model

The AI component is intentionally designed as an advisory security layer.

CloudShield provides the AI with relevant security context instead of allowing it to independently modify cloud infrastructure.

The AI is instructed to:

- Use only available CloudShield security information
- Avoid inventing resources or findings
- Prioritize critical and high-risk issues
- Provide practical security recommendations
- Avoid requesting or exposing credentials
- Avoid destructive commands
- Clearly distinguish recommendations from actions
- Never claim that an AWS change was performed unless the platform actually performed and verified it

This separation keeps AI-assisted analysis independent from infrastructure modification.

## Environment Variables

### Backend

Create a `.env` file inside `Backend/`.

Example:

```env
PORT=5000

DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
```

Use the exact environment variables required by the current AWS integration implementation.

Never commit `.env` files or real credentials to GitHub.

## Local Development

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- PostgreSQL
- Git

AWS credentials are required for the AWS integration features.

A Gemini API key is required for CloudShield AI features.

### Clone the repository

```bash
git clone https://github.com/Vaibhvee012/CloudShield.git
cd CloudShield
```

### Backend Setup

```bash
cd Backend
npm install
```

Configure the `.env` file and database connection.

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Start the backend:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

Health check:

```text
GET http://localhost:5000/api/health
```

### Frontend Setup

Open another terminal:

```bash
cd Frontend
npm install
npm run dev
```

The frontend will be available through the Vite development server.

## Production Build

### Backend

```bash
cd Backend
npm run build
```

### Frontend

```bash
cd Frontend
npm run build
```

## Current Implementation

CloudShield currently includes the following completed capabilities:

- Express backend foundation
- JWT authentication
- Role-based access control
- PostgreSQL persistence
- Prisma data models
- Cloud resource APIs
- AWS resource integration
- AWS resource synchronization
- Security findings
- Security posture calculation
- Remediation workflows
- AWS infrastructure visualization
- CloudShield AI assistant
- AI security insights
- AI finding explanations
- AI risk prioritization
- AI remediation recommendations
- AI input validation
- Gemini error handling
- Responsive dashboard and resource interfaces

## Development Roadmap

Future improvements include:

### Multi-Account AWS Connectivity

Allow users to securely connect their own AWS accounts using IAM role-based access and temporary credentials.

### Expanded AWS Coverage

Extend scanning to additional AWS services and security configurations.

Potential areas include:

- IAM
- CloudTrail
- CloudWatch
- VPC
- Security Groups
- RDS
- S3
- EC2

### Automated Security Rules

Expand the security scanning engine with a larger collection of configurable CSPM rules.

### Advanced Remediation

Introduce controlled remediation workflows with explicit user approval and verification.

### Compliance Mapping

Map security findings to frameworks and controls such as:

- CIS AWS Foundations
- AWS Well-Architected Security
- SOC 2
- ISO 27001

### Production Deployment

Deploy the frontend, backend, database, and AWS integration components using production-ready infrastructure and secure secret management.

## Design Principles

CloudShield is built around several principles:

1. **Visibility**  
   Provide a centralized view of cloud infrastructure.

2. **Risk prioritization**  
   Help users focus on the most important security issues.

3. **Least privilege**  
   Minimize the permissions required to inspect cloud infrastructure.

4. **Actionable security**  
   Provide practical remediation guidance instead of simply reporting problems.

5. **AI-assisted analysis**  
   Use Generative AI to make security information easier to understand and act upon.

6. **Safe automation**  
   Separate security recommendations from infrastructure changes and require explicit control over potentially impactful actions.

## Project Status

CloudShield is an actively developed project focused on combining cloud computing, cybersecurity, backend engineering, and Generative AI.

The current implementation is suitable for demonstrating:

- Full-stack application development
- REST API design
- Authentication and authorization
- Database modeling
- AWS integration
- Cloud security concepts
- Security posture management
- Generative AI integration
- AI-assisted security analysis
- Responsive dashboard development

## Author

**Vaibhvee Prakash**

- GitHub: [Vaibhvee012](https://github.com/Vaibhvee012)
- Portfolio: [vaibhvee-portfolio.vercel.app](https://vaibhvee-portfolio.vercel.app/)

## Repository

[CloudShield on GitHub](https://github.com/Vaibhvee012/CloudShield)
