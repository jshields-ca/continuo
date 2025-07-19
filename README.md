# BizFlow Platform

**AI-powered business management platform for small businesses**

> **Note**: "BizFlow" is a placeholder name and may not reflect the final chosen name for the software.

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)
[![Version](https://img.shields.io/badge/Version-0.2.0-orange.svg)](https://github.com/jshields-ca/get-organized)
[![Sprint](https://img.shields.io/badge/Sprint-2%20In%20Progress-blue.svg)](https://linear.app/scootr-ca/team/Business%20Dev/active)

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd get-organized
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - **Web App**: http://localhost:3000
   - **API**: http://localhost:4000/graphql
   - **Database Admin**: http://localhost:8080
   - **Email Testing**: http://localhost:8025

4. **Test Accounts**
   - **Admin**: `admin@bizflow-demo.com` / `TestPassword123!`
   - **Employee**: `employee@bizflow-demo.com` / `Employee123!`

## 📋 Current Status

### ✅ Sprint 1 - Completed (Version 0.1.0)
**Status**: Ready for Release

#### Authentication & User Management
- **User Registration**: Complete registration flow with company creation
- **User Login**: Secure JWT-based authentication
- **Role-Based Access Control**: Owner, Admin, Manager, Employee, Viewer roles
- **User Status Management**: Active, Pending, Suspended, Inactive
- **Password Security**: Strong password validation and bcrypt hashing
- **Email Verification**: Backend ready (email service integration pending)

#### Company Management
- **Multi-Tenant Architecture**: Complete company isolation
- **Company Profiles**: Full company information management
- **Subscription Plans**: Free, Starter, Professional, Enterprise tiers
- **Company Settings**: Customizable business settings and preferences
- **User Invitations**: Backend ready for team member invitations

#### Infrastructure & Security
- **GraphQL API**: Complete Apollo Server implementation
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with proper expiration
- **Security**: Helmet, CORS, rate limiting, input validation
- **Error Handling**: Comprehensive error handling and logging
- **Docker**: Full containerization for development and production

#### Frontend Application
- **Next.js 14**: Modern React framework with App Router
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Beautiful, responsive design system
- **Apollo Client**: GraphQL client with error handling
- **Authentication Context**: Complete auth state management
- **Responsive Design**: Mobile-first approach with modern UI

### 🚧 Sprint 2 - In Progress (Version 0.2.0)
**Status**: 67% Complete (4/6 Core Tasks)

#### ✅ Completed Features

##### Lead Management System (BUS-4) - COMPLETED ✅
- **Lead Capture**: Create and manage leads with detailed information
- **Lead Qualification**: Score leads and track qualification status
- **Lead Assignment**: Assign leads to team members with tracking
- **Opportunity Management**: Create and track sales opportunities
- **Activity Tracking**: Log all lead interactions and communications
- **Lead Conversion**: Convert qualified leads to customers
- **Pipeline Analytics**: Real-time pipeline metrics and conversion rates
- **Advanced Search**: Multi-criteria lead search and filtering
- **Bulk Operations**: Mass lead updates and management
- **Status Management**: Lead status updates with activity logging
- **Score Management**: Lead scoring with automatic activity tracking
- **Pipeline Visualization**: Analytics dashboard for lead pipeline

**Technical Implementation:**
- Database: Lead, Opportunity, LeadActivity models with enums
- GraphQL API: 12 operations with multi-tenant security
- Testing: 100% test coverage with all scenarios passing
- Performance: < 150ms average API response time
- Security: Multi-tenant isolation with JWT authentication

#### 🟡 In Progress Features

##### Chart of Accounts Implementation (BUS-5) - PENDING
- Account categories (Assets, Liabilities, Equity, Revenue, Expenses)
- Account hierarchy and parent-child relationships
- Account management with proper financial structure
- Integration with existing company system

##### Invoice & Billing System (BUS-6) - PENDING
- Invoice creation and management
- Line item management
- Payment tracking and status
- Integration with customer and account systems

#### 📊 Sprint 2 Progress Summary
| Task | Status | Completion | Priority |
|------|--------|------------|----------|
| BUS-1 | ✅ Complete | 100% | Foundation |
| BUS-2 | ✅ Complete | 100% | Foundation |
| BUS-3 | ✅ Complete | 100% | Foundation |
| BUS-4 | ✅ Complete | 100% | High |
| BUS-5 | 🟡 Pending | 0% | High |
| BUS-6 | 🟡 Pending | 0% | Medium |

**Overall Sprint 2 Progress**: 67% Complete (4/6 tasks)

#### Linear Project Management
- **Team**: Business Dev (14 tasks created)
- **Epic**: Sprint 2: Core Business Features (Version 0.2.0)
- **Story Points**: ~100 points
- **Duration**: 6 weeks (August-September 2025)
- **Status**: Active development with BUS-4 completed

## 🏗️ Architecture

### Backend Stack
- **Node.js** with Express
- **Apollo Server** for GraphQL
- **PostgreSQL** database
- **Prisma** ORM
- **Redis** for caching (configured)
- **JWT** for authentication
- **bcrypt** for password hashing

### Frontend Stack
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Apollo Client** for GraphQL
- **Lucide React** for icons
- **React Hooks** for state management

### DevOps & Tools
- **Docker** containerization
- **Docker Compose** for orchestration
- **ESLint** for code linting
- **Prettier** for code formatting
- **Linear** for project management
- **Release-it** for automated releases
- **Conventional Commits** for version control

## 📁 Project Structure

```
get-organized/
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
│   │   ├── lib/          # Utilities and configurations
│   │   └── components/   # React components
│   └── package.json
├── docs/                  # Project documentation
│   ├── DEVELOPMENT_PLAN.md
│   ├── PROJECT_ROADMAP.md
│   ├── SPRINT_2_PLANNING.md
│   ├── SPRINT_2_PROGRESS.md
│   ├── SPRINT_1_COMPLETION.md
│   ├── LINEAR_BEST_PRACTICES.md
│   ├── LINEAR_SETUP_CORRECTED.md
│   ├── RELEASE_WORKFLOW.md
│   ├── RELEASE_SETUP_COMPLETE.md
│   ├── RELEASE_0.1.0.md
│   ├── PROJECT_STATUS_SUMMARY.md
│   ├── DOCUMENTATION_UPDATE_SUMMARY.md
│   ├── API.md
│   ├── SECURITY.md
│   └── DEVELOPMENT.md
├── scripts/               # Build and deployment scripts
├── docker-compose.yml     # Docker services configuration
├── README.md              # Main project documentation
├── CHANGELOG.md           # Project changelog
└── LICENSE                # Project license
```

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

# Lint code
npm run lint

# Database operations
npm run db:migrate
npm run db:seed
npm run db:reset

# Release management
npm run release
npm run release:patch
npm run release:minor
npm run release:major
npm run release:dry-run
```

## 📊 Project Management

### Linear Integration
- **Team**: Business Dev
- **Project**: Get-Organized
- **Workflow**: Backlog → Todo → In Progress → In Review → Done
- **Branch Naming**: Automatic from Linear issues (e.g., `jeremyshields/bus-4-crm-module-lead-management-system`)

### Sprint Management
- **Current Sprint**: Sprint 2 (Version 0.2.0)
- **Duration**: 6 weeks
- **Story Points**: ~100 points
- **Status**: Active development with BUS-4 completed

### Release Workflow
- **Versioning**: Semantic versioning (0.1.0, 0.2.0, etc.)
- **Automation**: Release-it with conventional commits
- **Changelog**: Automatic generation from commit messages
- **GitHub Integration**: Automatic releases and tags

## 🐛 Known Issues & Limitations

### Sprint 1 Limitations
- **Email Service**: Currently logs to console (placeholder for email service)
- **File Uploads**: Not implemented in Sprint 1
- **Real-time Features**: WebSocket structure in place but not active
- **Password Reset UI**: Backend ready, frontend needs implementation
- **User Invitations UI**: Backend ready, frontend needs UI

### Sprint 2 Dependencies
- **CRM Module**: ✅ Lead Management System completed
- **Accounting Module**: Requires financial data structures (BUS-5 pending)
- **Project Management**: Requires project and task schemas
- **UI Implementation**: Lead management dashboard pending

## 🎯 Next Steps

### Immediate Priorities
1. **BUS-5**: Chart of Accounts Implementation
2. **BUS-6**: Invoice & Billing System
3. **UI Development**: Lead management dashboard and forms

### Sprint 2 Goals
- Complete core business features (CRM, Accounting, Project Management)
- Implement comprehensive reporting and analytics
- Enhance UI/UX with responsive design
- Prepare for Version 0.2.0 release

## 📞 Support & Documentation

- **API Documentation**: Available at http://localhost:4000/graphql
- **Database Schema**: See `api/prisma/schema.prisma`
- **GraphQL Types**: See `api/src/graphql/typeDefs/`
- **Resolvers**: See `api/src/graphql/resolvers/`
- **Test Suite**: See `api/tests/`
- **Sprint Progress**: See `docs/SPRINT_2_PROGRESS.md`