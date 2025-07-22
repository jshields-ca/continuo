# Linear Labels Reference Guide

## 📋 **Quick Reference for Issue Labeling**

This document provides a quick reference for all available labels in the Continuo project Linear workspace.

## 🏷️ **Label Categories**

### **Feature Labels** (Module/Area)
- `feature/crm` - Customer Relationship Management
- `feature/accounting` - Accounting and Finance
- `feature/projects` - Project Management
- `feature/reporting` - Reporting and Analytics
- `feature/ui-ux` - User Interface and Experience
- `feature/integrations` - Third-party integrations
- `feature/mobile` - Mobile-specific features
- `feature/analytics` - Advanced analytics and reporting
- `feature/enterprise` - Enterprise-level features

### **Type Labels** (Work Type)
- `type/new-feature` - New functionality
- `type/bug` - Bug fixes
- `type/enhancement` - Improvements to existing features
- `type/documentation` - Documentation updates
- `type/refactor` - Code refactoring
- `type/testing` - Testing and quality assurance
- `type/deployment` - Deployment and infrastructure issues
- `type/performance` - Performance optimization work
- `type/migration` - Database migrations and schema changes
- `type/audit` - Audit trail and compliance work

### **Component Labels** (Technical Area)
- `component/backend` - Backend/API work
- `component/frontend` - Frontend/UI work
- `component/database` - Database schema and migrations
- `component/security` - Security-related work
- `component/devops` - Infrastructure and deployment
- `component/graphql` - GraphQL schema and resolvers
- `component/api` - API endpoints and integrations
- `component/caching` - Redis and caching layer
- `component/monitoring` - Application monitoring and logging

### **Environment Labels** (Deployment Environment)
- `env/localhost` - Local development environment issues
- `env/railway-dev` - Railway development environment issues
- `env/production` - Production environment issues
- `env/staging` - Staging environment issues

### **Sprint Labels** (Development Sprint)
- `sprint/1` - Sprint 1 issues
- `sprint/2` - Sprint 2 issues
- `sprint/3` - Sprint 3 issues
- `sprint/4` - Sprint 4 issues

### **Complexity Labels** (Effort Estimation)
- `complexity/simple` - Simple tasks (< 2 hours)
- `complexity/moderate` - Moderate complexity (2-8 hours)
- `complexity/complex` - Complex tasks (1-3 days)
- `complexity/epic` - Epic-level work (1+ weeks)

### **Impact Labels** (User/Business Impact)
- `impact/critical` - Critical system functionality
- `impact/high` - High user impact
- `impact/medium` - Medium user impact
- `impact/low` - Low user impact

## 🎯 **Common Label Combinations**

### **New Feature Development**
```
feature/crm + type/new-feature + component/frontend + complexity/moderate + impact/high
```

### **Bug Fix**
```
feature/accounting + type/bug + component/backend + complexity/simple + impact/critical
```

### **Performance Optimization**
```
type/performance + component/database + complexity/complex + impact/medium
```

### **Deployment Issue**
```
type/deployment + component/devops + env/production + complexity/moderate + impact/high
```

### **Documentation Update**
```
type/documentation + component/frontend + complexity/simple + impact/low
```

### **Security Enhancement**
```
type/enhancement + component/security + complexity/moderate + impact/high
```

## 📝 **Label Usage Guidelines**

### **How Many Labels to Use**
- **Feature Labels**: 1-2 (main module(s) affected)
- **Type Labels**: 1 (work type)
- **Component Labels**: 1-2 (technical areas)
- **Environment Labels**: 1 (if environment-specific)
- **Sprint Labels**: 1 (current sprint)
- **Complexity Labels**: 1 (for estimation)
- **Impact Labels**: 1 (for prioritization)

### **When to Use Each Label Type**

#### **Feature Labels**
- Use when the issue affects a specific module or feature area
- Examples: CRM features, accounting functions, UI improvements

#### **Type Labels**
- Use to categorize the type of work being done
- Examples: new features, bug fixes, documentation updates

#### **Component Labels**
- Use to identify which technical components are involved
- Examples: backend API, frontend UI, database changes

#### **Environment Labels**
- Use when the issue is specific to a deployment environment
- Examples: production bugs, localhost testing issues

#### **Sprint Labels**
- Use to track which sprint the work belongs to
- Helps with sprint planning and retrospectives

#### **Complexity Labels**
- Use for effort estimation and planning
- Helps with sprint capacity planning

#### **Impact Labels**
- Use to indicate the impact on users or business
- Helps with prioritization decisions

## 🔍 **Filtering and Searching**

### **Common Filter Combinations**

#### **View All CRM Work**
```
feature/crm
```

#### **View All Bugs**
```
type/bug
```

#### **View High Impact Issues**
```
impact/high OR impact/critical
```

#### **View Sprint 2 Work**
```
sprint/2
```

#### **View Production Issues**
```
env/production
```

#### **View Complex Frontend Work**
```
component/frontend AND complexity/complex
```

## 📊 **Reporting with Labels**

### **Sprint Metrics**
- Filter by `sprint/X` to see sprint-specific work
- Combine with `complexity/` labels for effort tracking
- Use `impact/` labels for value delivery analysis

### **Feature Development**
- Filter by `feature/X` to see module-specific progress
- Combine with `type/new-feature` for new development
- Use `type/enhancement` for improvements

### **Technical Debt**
- Filter by `type/refactor` or `type/performance`
- Combine with `impact/` labels for prioritization

### **Quality Assurance**
- Filter by `type/bug` to track bug resolution
- Combine with `type/testing` for testing work
- Use `env/` labels to track environment-specific issues

## 🚀 **Best Practices**

### **Label Selection**
1. **Start with Feature**: What module/area is affected?
2. **Add Type**: What type of work is this?
3. **Include Component**: What technical components are involved?
4. **Consider Environment**: Is this environment-specific?
5. **Add Sprint**: Which sprint does this belong to?
6. **Estimate Complexity**: How complex is this work?
7. **Assess Impact**: What's the user/business impact?

### **Label Maintenance**
- Review labels quarterly for relevance
- Remove unused labels to keep the system clean
- Add new labels as the project evolves
- Ensure consistent usage across the team

### **Label Training**
- Share this reference guide with new team members
- Use label combinations as examples in issue templates
- Review label usage in sprint retrospectives

---

**Last Updated**: July 22, 2025  
**Version**: 1.0  
**Status**: Active Reference Guide

> **Note**: This guide should be used in conjunction with the [Linear Best Practices](./LINEAR_BEST_PRACTICES.md) document for comprehensive issue management guidelines. 