# Release Workflow Guide

## 🚀 **Release Process Overview**

This document outlines the release workflow for the Continuo platform using release-it and conventional commits. The workflow ensures consistent, automated releases with proper versioning, changelog generation, and deployment preparation.

## 🏷️ Versioning Strategy

### Semantic Versioning (SemVer)
- **MAJOR.MINOR.PATCH** (e.g., 0.1.0)
- **0.x.x**: Development releases (Sprint 1-4)
- **1.0.0**: First beta release
- **2.0.0+**: Production releases

### Version Progression
- **0.1.0**: Sprint 1 Complete (Foundation)
- **0.2.5**: Sprint 2 In Progress (Core Business Features - 75% Complete)
- **0.3.0**: Sprint 3 Complete (Advanced Features)
- **0.4.0**: Sprint 4 Complete (AI & Automation)
- **1.0.0**: Beta Release (Complete feature set)

## 🔧 Prerequisites

### Required Tools
- **Node.js** 18+
- **Git** with proper configuration
- **GitHub** access with write permissions
- **release-it** (installed as dev dependency)

### Environment Setup
```bash
# Install dependencies
npm run install:all

# Install release-it globally (optional)
npm install -g release-it

# Verify Git configuration
git config --list | grep user
```

## 📝 Commit Convention

### Conventional Commits
All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types
- **feat**: New features
- **fix**: Bug fixes
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```bash
# Feature commit
git commit -m "feat: add user authentication system"

# Bug fix commit
git commit -m "fix: resolve JWT token expiration issue"

# Documentation commit
git commit -m "docs: update API documentation"

# Breaking change
git commit -m "feat!: change authentication API structure

BREAKING CHANGE: The login endpoint now requires additional parameters"
```

## 🚀 Release Process

### 1. Pre-Release Preparation

#### Code Quality Checks
```bash
# Run linting
npm run lint

# Run tests
npm run test

# Build the application
npm run build

# Check for any uncommitted changes
git status
```

#### Update Documentation
- Ensure all documentation is up to date
- Update README.md if needed
- Review CHANGELOG.md for accuracy

### 2. Release Commands

#### Interactive Release (Recommended)
```bash
# Start interactive release process
npm run release
```

This will:
1. Run pre-release checks (lint, test, build)
2. Determine the next version based on commits
3. Update version numbers across all files
4. Generate changelog
5. Create Git tag
6. Push to GitHub
7. Create GitHub release

#### Specific Version Release
```bash
# Patch release (0.1.0 → 0.1.1)
npm run release:patch

# Minor release (0.1.0 → 0.2.0)
npm run release:minor

# Major release (0.1.0 → 1.0.0)
npm run release:major
```

#### Dry Run (Testing)
```bash
# Test release process without making changes
npm run release:dry-run

# Preview what will be released
npm run release:preview
```

### 3. Post-Release Steps

#### Verify Release
1. Check GitHub releases page
2. Verify Git tag was created
3. Review generated changelog
4. Test the application

#### Deployment
```bash
# Deploy to staging (if applicable)
npm run deploy:staging

# Deploy to production (when ready)
npm run deploy:production
```

## 📋 Release Checklist

### Before Release
- [ ] All tests pass (`npm run test`)
- [ ] Code linting passes (`npm run lint`)
- [ ] Application builds successfully (`npm run build`)
- [ ] Documentation is up to date
- [ ] No uncommitted changes (`git status`)
- [ ] Branch is up to date with main (`git pull origin main`)

### During Release
- [ ] Run release command (`npm run release`)
- [ ] Review version bump
- [ ] Review changelog generation
- [ ] Confirm Git operations
- [ ] Verify GitHub release creation

### After Release
- [ ] Verify GitHub release
- [ ] Test deployed application
- [ ] Update deployment documentation
- [ ] Notify team members
- [ ] Archive release summary

## 🔄 Automated Workflow

### Pre-commit Hooks
Husky and lint-staged automatically run:
- Code linting
- Formatting
- Tests (if configured)

### Release Hooks
release-it automatically runs:
- **before:init**: Lint, test, build
- **after:bump**: Update version numbers
- **after:git:release**: Post-release tasks

## 📊 Release Scripts

### Available Commands
```bash
# Main release command
npm run release

# Specific version releases
npm run release:patch    # 0.1.0 → 0.1.1
npm run release:minor    # 0.1.0 → 0.2.0
npm run release:major    # 0.1.0 → 1.0.0

# Testing and preview
npm run release:dry-run  # Test without changes
npm run release:preview  # Preview release
npm run changelog        # Generate changelog only
```

### Custom Scripts
```bash
# Update version across all files
node scripts/update-version.js <version>

# Post-release tasks
node scripts/post-release.js
```

## 🐛 Troubleshooting

### Common Issues

#### Release Fails Due to Tests
```bash
# Fix failing tests first
npm run test

# Then retry release
npm run release
```

#### Release Fails Due to Linting
```bash
# Fix linting issues
npm run lint:fix

# Then retry release
npm run release
```

#### Git Authentication Issues
```bash
# Ensure GitHub token is configured
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Or use GitHub CLI
gh auth login
```

#### Version Conflicts
```bash
# Check current version
npm version

# Manually update if needed
node scripts/update-version.js <version>
```

### Emergency Rollback
```bash
# Delete the tag locally
git tag -d v<version>

# Delete the tag on GitHub
git push origin :refs/tags/v<version>

# Reset to previous commit
git reset --hard HEAD~1

# Force push (use with caution)
git push --force-with-lease origin main
```

## 📈 Release Metrics

### Tracking
- Release frequency
- Time from commit to release
- Number of breaking changes
- Test coverage at release
- Deployment success rate

### Reporting
- Release summaries are automatically generated
- Stored in `RELEASE_SUMMARY.md`
- Include metrics and next steps

## 🔗 Useful Resources

### Documentation
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [release-it Documentation](https://github.com/release-it/release-it)
- [Husky Documentation](https://typicode.github.io/husky/)

### Tools
- [Commitizen](https://github.com/commitizen/cz-cli) - Interactive commit messages
- [Commitlint](https://github.com/conventional-changelog/commitlint) - Validate commit messages
- [Standard Version](https://github.com/conventional-changelog/standard-version) - Alternative to release-it

---

*Last updated: July 19, 2025* 