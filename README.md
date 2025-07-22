# Continuo Platform

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)
![Version](https://img.shields.io/badge/Version-0.2.5-orange.svg)
[![Sprint](https://img.shields.io/badge/Sprint-2%2075%25%20In%20Progress-yellow.svg)](https://linear.app/scootr-ca/team/Business%20Dev/active)
[![Production](https://img.shields.io/badge/Production-continuo.pro-brightgreen.svg)](https://continuo.pro)

**AI-powered business management platform for small businesses**

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
   - **Web App (Production)**: https://continuo.pro
   - **Web App (Dev)**: https://continuo-web-dev.up.railway.app
   - **API (Production)**: https://api.continuo.pro/graphql
   - **API (Dev)**: https://continuo-api-dev.up.railway.app/graphql
   - **Local Web App**: http://localhost:3000
   - **Local API**: http://localhost:4000/graphql
   - **Database Admin**: http://localhost:8080
   - **Email Testing**: http://localhost:8025

| Environment      | Web App URL                                   | API URL                                         | Status   |
|------------------|-----------------------------------------------|-------------------------------------------------|----------|
| Production       | https://continuo.pro                          | https://api.continuo.pro/graphql                | Live     |
| Dev (Railway)    | https://continuo-web-dev.up.railway.app       | https://continuo-api-dev.up.railway.app/graphql | Live     |
| Localhost        | http://localhost:3000                         | http://localhost:4000/graphql                   | Local    |

4. **Test Accounts**
   - **Admin**: `admin@continuo-demo.com` / `TestPassword123!`
   - **Employee**: `employee@continuo-demo.com` / `Employee123!`

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

## 📄 Documentation

For detailed project status, roadmap, and development planning, see:
- [Project Status Summary](./docs/PROJECT_STATUS_SUMMARY.md)
- [Project Roadmap](./docs/PROJECT_ROADMAP.md)
- [Development Plan](./docs/DEVELOPMENT_PLAN.md)

Additional documentation:
- [API Reference](./docs/API.md)
- [Security](./docs/SECURITY.md)
- [Release Workflow](./docs/RELEASE_WORKFLOW.md)

---

## 🔧 Development

### Running Locally

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

2. **Run database migrations**
   ```bash
   docker-compose exec api npm run db:migrate
   ```

3. **Seed the database**
   ```bash
   docker-compose exec api npm run db:seed
   ```

4. **View logs**
   ```bash
   docker-compose logs -f
   ```

### Development Commands

```bash
# Start development servers
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Database operations
npm run db:migrate
npm run db:seed
npm run db:reset
```

---

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This project is currently in active development. For questions or support, please contact the development team.

---

## 📚 Full Documentation Index

### Canonical Docs
- [Project Status Summary](./docs/PROJECT_STATUS_SUMMARY.md) *(Single source for current status, sprints, and progress)*
- [Project Roadmap](./docs/PROJECT_ROADMAP.md) *(Single source for future plans and features)*
- [Development Plan](./docs/DEVELOPMENT_PLAN.md) *(Single source for technical approach and methodology)*
- [API Reference](./docs/API.md)
- [Security](./docs/SECURITY.md)
- [Release Workflow](./docs/RELEASE_WORKFLOW.md)
- [Changelog](./CHANGELOG.md)

### Technical & Environment Docs
- [Localhost Testing Fixes](./docs/LOCALHOST_TESTING_FIXES.md)
- [Production Hosting Requirements](./docs/PRODUCTION_HOSTING_REQUIREMENTS.md)
- [Railway Deployment](./docs/RAILWAY_DEPLOYMENT.md)
- [Database Migrations](./docs/DATABASE_MIGRATIONS.md)

### Process & Best Practices
- [Linear Best Practices](./docs/LINEAR_BEST_PRACTICES.md)
- [Linear Labels Reference](./docs/LINEAR_LABELS_REFERENCE.md)
- [Linear Setup Corrected](./docs/LINEAR_SETUP_CORRECTED.md)
- [File Structure Reorganization](./docs/FILE_STRUCTURE_REORGANIZATION_COMPLETE.md)
- [Security](./docs/SECURITY.md)

### Historical & Sprint Docs
- [Sprint 2 Planning](./docs/SPRINT_2_PLANNING.md)
- [Sprint 2 Status](./docs/SPRINT_2_COMPLETE.md)
- [Sprint 1 Completion](./docs/SPRINT_1_COMPLETION.md)
- [Release 0.1.0](./docs/RELEASE_0.1.0.md)
- [Release Setup Complete](./docs/RELEASE_SETUP_COMPLETE.md)
- [Rebranding to Continuo Complete](./docs/REBRANDING_TO_CONTINUO_COMPLETE.md)
- [BUS_3 Contact Management Complete](./docs/BUS_3_CONTACT_MANAGEMENT_COMPLETE.md)
- [BUS_5 Frontend Implementation](./docs/BUS_5_FRONTEND_IMPLEMENTATION.md)
- [CRM Frontend Implementation](./docs/CRM_FRONTEND_IMPLEMENTATION.md)
- [Testing Phase Plan](./docs/TESTING_PHASE_PLAN.md)

---

## 🗂️ Issues & Project Management

- **Internal Planning & Status:** Use [Linear](https://linear.app/scootr-ca/team/Business%20Dev/active) for all sprint, epic, and planning issues. All internal docs link to Linear issues/epics.
- **Public Bug Reports & Feature Requests:** Use [GitHub Issues](https://github.com/jshields-ca/Continuo/issues) for open source contributions and public tracking. Public docs link to GitHub issues.

---