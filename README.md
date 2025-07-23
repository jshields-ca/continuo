# Continuo Platform

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)
![Version](https://img.shields.io/badge/Version-0.2.5-orange.svg)
[![Sprint](https://img.shields.io/badge/Sprint-2%2085%25%20In%20Progress-yellow.svg)](https://linear.app/scootr-ca/team/Business%20Dev/active)
[![Production](https://img.shields.io/badge/Production-continuo.pro-brightgreen.svg)](https://continuo.pro)

**AI-powered business management platform for small businesses**

---

## 📚 Documentation Hub

- **Full documentation index:** [docs/README.md](./docs/README.md)

For detailed project status, roadmap, and development planning, see:
- [Project Status Summary](./docs/PROJECT_STATUS_SUMMARY.md)
- [Project Roadmap](./docs/PROJECT_ROADMAP.md)
- [Development Plan](./docs/DEVELOPMENT_PLAN.md)
- [API Reference](./docs/API.md)
- [Security](./docs/SECURITY.md)
- [Release Workflow](./docs/RELEASE_WORKFLOW.md)
- [Changelog](./CHANGELOG.md)

---

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Continuo
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**

| Environment      | Web App URL                                   | API URL                                         | Database Admin | Email Testing | Status   |
|------------------|-----------------------------------------------|-------------------------------------------------|----------------|---------------|----------|
| Production       | https://continuo.pro                          | https://api.continuo.pro/graphql                | -              | -             | Live     |
| Dev (Railway)    | https://continuo-web-dev.up.railway.app       | https://continuo-api-dev.up.railway.app/graphql | -              | -             | Live     |
| Localhost        | http://localhost:3000                         | http://localhost:4000/graphql                   | http://localhost:8080 | http://localhost:8025 | Local    |

4. **Test Accounts**
   - **Admin**: `admin@continuo-demo.com` / `TestPassword123!`
   - **Employee**: `employee@continuo-demo.com` / `Employee123!`
   - **Avery Test**: `avery@tester.com` / `NewPassword123!`

---

## 🏗️ Architecture

### Backend Stack
- Node.js with Express
- Apollo Server for GraphQL
- PostgreSQL database
- Prisma ORM
- Redis for caching (configured)
- JWT for authentication
- bcrypt for password hashing

### Frontend Stack
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Apollo Client for GraphQL
- Lucide React for icons
- React Hooks for state management

### DevOps & Tools
- Docker containerization
- Docker Compose for orchestration
- ESLint for code linting
- Prettier for code formatting
- Linear for project management
- Release-it for automated releases
- Conventional Commits for version control

## 📁 Project Structure

```
Continuo/
├── api/                    # Backend API
│   ├── src/
│   │   ├── graphql/       # GraphQL resolvers and types
│   │   │   ├── typeDefs/  # GraphQL type definitions
│   │   │   └── resolvers/ # GraphQL resolvers
│   │   ├── shared/        # Shared utilities and middleware
│   │   └── index.js       # Main server file
│   ├── prisma/            # Database schema and migrations
│   ├── database/          # Seeds and database utilities
│   ├── tests/             # API tests
│   └── package.json
├── web-app/               # Frontend application
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   │   ├── dashboard/ # Dashboard pages
│   │   │   │   ├── accounts/    # Chart of Accounts
│   │   │   │   ├── transactions/ # Transaction Management
│   │   │   │   ├── invoices/    # Invoice Management (Complete)
│   │   │   │   ├── customers/   # Customer Database
│   │   │   │   ├── contacts/    # Contact Management
│   │   │   │   ├── leads/       # Lead Management
│   │   │   │   └── debug/       # Debug Page
│   │   │   └── auth/      # Authentication pages
│   │   ├── lib/          # Utilities and configurations
│   │   └── components/   # React components
│   └── package.json
├── docs/                  # Project documentation
│   ├── DEVELOPMENT_PLAN.md
│   ├── PROJECT_ROADMAP.md
│   ├── PROJECT_STATUS_SUMMARY.md
│   ├── ...
├── scripts/               # Build and deployment scripts
├── docker-compose.yml     # Docker services configuration
├── README.md              # Main project documentation
├── CHANGELOG.md           # Project changelog
└── LICENSE                # Project license
```

---

## 🗂️ Issues & Project Management

- **Internal Planning & Status:** Use [Linear](https://linear.app/scootr-ca/team/Business%20Dev/active) for all sprint, epic, and planning issues. All internal docs link to Linear issues/epics.
- **Public Bug Reports & Feature Requests:** Use [GitHub Issues](https://github.com/jshields-ca/Continuo/issues) for open source contributions and public tracking. Public docs link to GitHub issues.

---