# BizFlow Platform

**AI-powered business management platform for small businesses**

> **Note**: "BizFlow" is a placeholder name and may not reflect the final chosen name for the software.

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)
[![Version](https://img.shields.io/badge/Version-0.1.0-orange.svg)](https://github.com/jshields-ca/get-organized)
[![Sprint](https://img.shields.io/badge/Sprint-2%20Planning-blue.svg)](https://linear.app/scootr-ca/team/Business%20Dev/active)

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

### 🚧 Sprint 2 - In Planning (Version 0.2.0)
**Status**: Linear Tasks Created, Ready for Development

#### Core Business Features
- **CRM Module**: Customer database, contact management, lead management
- **Accounting Module**: Chart of accounts, transaction management, invoice generation
- **Project Management**: Project creation, task management, time tracking
- **Reporting & Analytics**: Dashboard implementation, custom report builder
- **Enhanced UI/UX**: Responsive design, advanced component library

#### Linear Project Management
- **Team**: Business Dev (14 tasks created)
- **Epic**: Sprint 2: Core Business Features (Version 0.2.0)
- **Story Points**: ~100 points
- **Duration**: 6 weeks (August-September 2025)
- **Status**: Ready for assignment and development

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
│   ├── SPRINT_2_DEVELOPMENT_START.md
│   ├── LINEAR_BEST_PRACTICES.md
│   ├── LINEAR_SETUP_CORRECTED.md
│   ├── RELEASE_WORKFLOW.md
│   ├── RELEASE_SETUP_COMPLETE.md
│   ├── RELEASE_0.1.0.md
│   ├── PROJECT_STATUS_SUMMARY.md
│   ├── SPRINT_1_COMPLETION.md
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
- **Branch Naming**: Automatic from Linear issues (e.g., `jeremyshields/bus-2-crm-module`)

### Sprint Management
- **Current Sprint**: Sprint 2 (Version 0.2.0)
- **Duration**: 6 weeks
- **Story Points**: ~100 points
- **Status**: Planning complete, ready for development

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
- **CRM Module**: Requires customer database schema
- **Accounting Module**: Requires financial data structures
- **Project Management**: Requires project and task schemas
- **Reporting**: Depends on all other modules for data

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive validation on all inputs
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Proper cross-origin resource sharing
- **Helmet Security**: Security headers and protection
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **XSS Protection**: Input sanitization and output encoding

## 📊 API Documentation

### GraphQL Endpoint
- **URL**: http://localhost:4000/graphql
- **Playground**: Available in development mode

### Key Queries
- `me`: Get current user information
- `myCompany`: Get current user's company
- `users`: Get company users (admin only)

### Key Mutations
- `register`: Create new user and company
- `login`: Authenticate user
- `updateUser`: Update user profile
- `updateCompany`: Update company information

## 📚 Documentation

### Core Documentation
- **[Development Plan](docs/DEVELOPMENT_PLAN.md)**: Comprehensive project overview and planning
- **[Sprint 2 Planning](docs/SPRINT_2_PLANNING.md)**: Detailed Sprint 2 feature breakdown
- **[Project Roadmap](docs/PROJECT_ROADMAP.md)**: Long-term vision and milestones
- **[Linear Best Practices](docs/LINEAR_BEST_PRACTICES.md)**: Project management guidelines

### Technical Documentation
- **[API Documentation](docs/API.md)**: GraphQL schema and endpoints
- **[Security Guide](docs/SECURITY.md)**: Security implementation details
- **[Development Guide](docs/DEVELOPMENT.md)**: Development setup and guidelines
- **[Release Workflow](docs/RELEASE_WORKFLOW.md)**: Release process and automation

### Project Status
- **[Project Status Summary](docs/PROJECT_STATUS_SUMMARY.md)**: Current project overview
- **[Sprint 1 Completion](docs/SPRINT_1_COMPLETION.md)**: Sprint 1 achievements and deliverables
- **[Linear Setup](docs/LINEAR_SETUP_CORRECTED.md)**: Linear project management setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch from Linear issue
3. Follow conventional commit format
4. Ensure all tests pass
5. Create a Pull Request linked to Linear issue

### Commit Convention
```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(crm): add customer database implementation`
- `fix(accounting): resolve invoice calculation bug`
- `docs(api): update GraphQL schema documentation`

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: See [docs/](docs/) directory
- **Issues**: Create an issue on GitHub or Linear
- **API Health**: http://localhost:4000/health
- **Linear Project**: [Business Dev Team](https://linear.app/scootr-ca/team/Business%20Dev/active)

## 🎯 Roadmap

### Version 0.2.0 - Sprint 2: Core Business Features (In Planning)
- **CRM Module**: Customer database, contact management, lead management
- **Accounting Module**: Chart of accounts, transaction management, invoice generation
- **Project Management**: Project creation, task management, time tracking
- **Reporting & Analytics**: Dashboard implementation, custom report builder
- **Enhanced UI/UX**: Responsive design, advanced component library

### Version 0.3.0 - Sprint 3: Advanced Features
- Advanced Reporting and Analytics
- Third-party Integrations
- Mobile App Development
- Advanced Business Intelligence

### Version 0.4.0 - Sprint 4: AI & Automation
- AI-powered Insights
- Workflow Automation
- Predictive Analytics
- Advanced AI Features

### Version 1.0.0 - Beta Release
- Complete feature set
- Production deployment
- Beta customer onboarding
- Mobile application release

---

**BizFlow Platform** - Empowering small businesses with intelligent management tools.

> **Note**: This is a placeholder name and may not reflect the final chosen name for the software.