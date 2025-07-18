# LocalBiz Pro

[![Build Status](https://img.shields.io/github/actions/workflow/status/your-org/your-repo/ci.yml?branch=main)](https://github.com/your-org/your-repo/actions)
[![License](https://img.shields.io/github/license/your-org/your-repo)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-blue)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Sprint 1 Status](https://img.shields.io/badge/Sprint%201-Complete-brightgreen)](project-docs/SPRINT_1_STATUS.md)
[![Changelog](https://img.shields.io/badge/Changelog-0.1.0-blue)](CHANGELOG.md)

A modern, all-in-one business management platform for local service businesses built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

---

## 🚀 Features
- **Authentication System**
  - Email/password registration and login
  - Google OAuth integration
  - Secure session management with NextAuth.js v5+
  - Protected routes and middleware
- **Modern UI/UX**
  - Responsive design with Tailwind CSS
  - shadcn/ui component library
  - Mobile-first approach
  - Dark mode support
- **Database & Backend**
  - PostgreSQL with Prisma ORM
  - Type-safe API routes
  - User and company management
  - Secure password hashing

---

## 📦 Project Structure

```
localbiz-pro/
├── prisma/                  # Database schema
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── lib/                 # Utility libraries
│   └── types/               # TypeScript type definitions
├── project-docs/            # Documentation, plans, status, PRs
│   ├── SPRINT_1_STATUS.md
│   ├── SPRINT_1_PR.md
│   └── ...
├── CHANGELOG.md             # Release notes
├── README.md                # Project overview
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── next.config.js
└── ...
```

---

## 📋 Documentation & Status
- [Changelog](CHANGELOG.md)
- [Sprint 1 Status Report](project-docs/SPRINT_1_STATUS.md)
- [Sprint 1 Pull Request](project-docs/SPRINT_1_PR.md)
- [Development Plan](project-docs/local_business_web_app_development_plan.md)
- [Research Report](project-docs/local_business_web_application_research_report.md)

---

## 🛠 Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL + Prisma
- **Authentication:** NextAuth.js v5+
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

---

## 📋 Prerequisites
- Node.js 18+
- PostgreSQL database
- npm/yarn/pnpm package manager

---

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/your-repo.git
   cd localbiz-pro
   ```
2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```
3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```
4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma studio # (optional)
   ```
5. **Start development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing
```bash
# Run unit tests
npm run test
# Run end-to-end tests
npm run test:e2e
```

---

## 🚀 Deployment
- **Vercel (Recommended):** Connect your repo, add env vars, deploy on push
- **Manual:**
  ```bash
  npm run build
  npm start
  ```

---

## 🔐 Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_URL` | Application URL | ✅ |
| `NEXTAUTH_SECRET` | JWT secret key | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ⚠️ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ⚠️ |

⚠️ = Optional for basic functionality

---

## 🏆 Sprint 1 Achievements
- [x] User registration and authentication (email/password, Google OAuth)
- [x] Responsive design for mobile and desktop
- [x] Database schema for users and companies
- [x] Form validation and error handling
- [x] Clean, modern UI with consistent styling
- [x] Production-ready configuration and documentation

See [Sprint 1 Status Report](project-docs/SPRINT_1_STATUS.md) for full details.

---

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support
- Create an issue in the GitHub repository
- See [project-docs/](project-docs/) for all documentation and sprint details
- See [CHANGELOG.md](CHANGELOG.md) for release history

---

## 🚀 Releases & Conventional Commits

This project uses [release-it](https://github.com/release-it/release-it) and [commitizen](https://github.com/commitizen/cz-cli) for automated versioning, changelogs, and releases.

- **To make a conventional commit:**
  ```bash
  npm run commit
  ```
  (Follow the prompts for type, scope, and message)

- **To create a new release:**
  ```bash
  npm run release
  ```
  (Choose the version, changelog is auto-generated, tags and GitHub release are created)

See [CHANGELOG.md](CHANGELOG.md) for release history.

---

**LocalBiz Pro** - Simplifying business management for local service providers.