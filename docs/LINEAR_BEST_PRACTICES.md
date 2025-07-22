# Linear Best Practices for Continuo Development

> **📝 Update Notice (July 22, 2025)**: This document has been updated to reflect the new Linear status workflow and corrected label naming to avoid conflicts. The status workflow now includes more granular testing stages, and priority is tracked using Linear's built-in priority field instead of labels.

> **🏷️ Label Update (July 22, 2025)**: Added comprehensive label structure including Environment, Sprint, Complexity, and Impact labels for better issue categorization and tracking. See the Label Usage Guidelines section for best practices.

## 📋 **Linear Setup Overview**

### Project Structure
- **Team**: Business Dev (f42ec684-5540-47fd-8ff2-6a488004cac3)
- **Project**: Continuo (e9205c7b-a881-498d-acdf-8361f3bfcdd4)
- **Issue Statuses**: Backlog, Todo, In Progress, Dev (Localhost) Testing, Dev (Railway) Testing, Prod Testing, Ready for Release, In Review, PR Approved, Done, Canceled, Duplicate

### Issue Status Workflow
```
Backlog → Todo → In Progress → Dev (Localhost) Testing → Dev (Railway) Testing → Prod Testing → Ready for Release → In Review → PR Approved → Done
```
- **Backlog**: Not yet planned for work, future consideration (Default status).
- **Todo**: Planned and ready to be worked on in the current or next sprint.
- **In Progress**: Actively being worked on by an assignee.
- **Dev (Localhost) Testing**: Feature/bugfix is ready for or undergoing localhost 'dev' environment testing.
- **Dev (Railway) Testing**: Feature/bugfix is deployed to Railway 'development' environment for testing.
- **Prod Testing**: Feature/bugfix is deployed to production environment for final verification.
- **Ready for Release**: Feature/bugfix is complete and ready for next release/PR.
- **In Review**: Pull request is being reviewed.
- **PR Approved**: Pull Request has been approved and is ready for merge.
- **Done**: Completed, merged, and deployed as appropriate.
- **Canceled**: Work was stopped and will not be completed.
- **Duplicate**: Issue is a duplicate of another and will not be worked on.

> **Note:** If any labels listed in this document are not present in Linear, they should be created to ensure consistent issue tracking and filtering.

### Priority Levels
- **Urgent (1)**: Critical bugs, security issues, blocking issues
- **High (2)**: Sprint features, major functionality
- **Medium (3)**: Enhancements, improvements
- **Low (4)**: Nice-to-have features, documentation
- **No Priority (0)**: Backlog items, future considerations

## 🏷️ Issue Labeling Strategy

### Label Usage Guidelines
- **Feature Labels**: Use 1-2 feature labels to identify the main module(s) affected
- **Type Labels**: Use 1 type label to categorize the work type
- **Component Labels**: Use 1-2 component labels to identify technical areas
- **Environment Labels**: Use when the issue is environment-specific
- **Sprint Labels**: Use to track which sprint the work belongs to
- **Complexity Labels**: Use for estimation and planning purposes
- **Impact Labels**: Use to indicate user/business impact for prioritization

### Label Combinations Examples
- **New Feature**: `feature/crm` + `type/new-feature` + `component/frontend` + `complexity/moderate` + `impact/high`
- **Bug Fix**: `feature/accounting` + `type/bug` + `component/backend` + `complexity/simple` + `impact/critical`
- **Deployment**: `type/deployment` + `component/devops` + `env/production` + `complexity/moderate` + `impact/high`
- **Performance**: `type/performance` + `component/database` + `complexity/complex` + `impact/medium`

### Feature Labels
- `feature/crm` - Customer Relationship Management
- `feature/accounting` - Accounting and Finance
- `feature/projects` - Project Management
- `feature/reporting` - Reporting and Analytics
- `feature/ui-ux` - User Interface and Experience
- `feature/integrations` - Third-party integrations
- `feature/mobile` - Mobile-specific features
- `feature/analytics` - Advanced analytics and reporting
- `feature/enterprise` - Enterprise-level features

### Type Labels
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

> **Note:** Priority is tracked directly on the issue using Linear's built-in priority field (Urgent, High, Medium, Low, No Priority). No separate priority labels are needed.

### Component Labels
- `component/backend` - Backend/API work
- `component/frontend` - Frontend/UI work
- `component/database` - Database schema and migrations
- `component/security` - Security-related work
- `component/devops` - Infrastructure and deployment
- `component/graphql` - GraphQL schema and resolvers
- `component/api` - API endpoints and integrations
- `component/caching` - Redis and caching layer
- `component/monitoring` - Application monitoring and logging

### Environment Labels
- `env/localhost` - Local development environment issues
- `env/railway-dev` - Railway development environment issues
- `env/production` - Production environment issues
- `env/staging` - Staging environment issues

### Sprint Labels
- `sprint/1` - Sprint 1 issues
- `sprint/2` - Sprint 2 issues
- `sprint/3` - Sprint 3 issues
- `sprint/4` - Sprint 4 issues

### Complexity Labels
- `complexity/simple` - Simple tasks (< 2 hours)
- `complexity/moderate` - Moderate complexity (2-8 hours)
- `complexity/complex` - Complex tasks (1-3 days)
- `complexity/epic` - Epic-level work (1+ weeks)

### Impact Labels
- `impact/critical` - Critical system functionality
- `impact/high` - High user impact
- `impact/medium` - Medium user impact
- `impact/low` - Low user impact

## 📝 Issue Creation Guidelines

### Issue Title Convention
```
[Module] Brief description of the feature/task
```

Examples:
- `[CRM Module] Customer Database Implementation`
- `[Accounting Module] Invoice Generation System`
- `[Project Management] Time Tracking System`
- `[UX] Responsive Design Implementation`

> **All new issues must use this bracketed format. Automated checks will flag issues that do not comply.**

### Issue Description Template
```markdown
# [Issue Title]

## Overview
Brief description of what this issue accomplishes.

## Requirements
- Requirement 1
- Requirement 2
- Requirement 3

## Technical Tasks
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Estimation
- **Story Points**: X
- **Priority**: Urgent/High/Medium/Low/No Priority (use Linear's built-in priority field)
- **Dependencies**: List any dependencies

## Labels
- **Feature**: [Select appropriate feature label(s)]
- **Type**: [Select appropriate type label]
- **Component**: [Select appropriate component label(s)]
- **Environment**: [Select if environment-specific]
- **Sprint**: [Select appropriate sprint label]
- **Complexity**: [Select appropriate complexity label]
- **Impact**: [Select appropriate impact label]

## Related Issues
- Links to related issues

---
*Part of [Module/Sprint]*
```

### Story Point Estimation
- **1 Point**: Simple task, < 2 hours
- **2 Points**: Small task, 2-4 hours
- **3 Points**: Medium task, 4-8 hours
- **5 Points**: Large task, 1-2 days
- **8 Points**: Complex task, 2-3 days
- **13 Points**: Epic task, 3-5 days
- **21 Points**: Major feature, 1+ weeks

## 🔄 Workflow Best Practices

### Sprint Planning
1. **Create Epic Issues**: One epic per major feature/module
2. **Break Down Tasks**: Create detailed subtasks for each epic
3. **Estimate Story Points**: Assign story points to all tasks
4. **Set Priorities**: Assign appropriate priority levels
5. **Identify Dependencies**: Link dependent issues

### Daily Workflow
1. **Start of Day**: Review assigned issues and update status
2. **During Work**: Update issue progress and add comments
3. **End of Day**: Update issue status and add progress notes

### Issue Status Transitions
- **Backlog → Todo**: Issue is planned and ready for work
- **Todo → In Progress**: Work has started on the issue
- **In Progress → Dev (Localhost) Testing**: Feature is ready for local development testing
- **Dev (Localhost) Testing → Dev (Railway) Testing**: Feature is deployed to Railway development environment
- **Dev (Railway) Testing → Prod Testing**: Feature is deployed to production for final testing
- **Prod Testing → Ready for Release**: Feature is complete and ready for release
- **Ready for Release → In Review**: Pull request is created and under review
- **In Review → PR Approved**: Pull request is approved and ready for merge
- **PR Approved → Done**: Code is merged and deployed
- **Done**: Issue is complete and deployed

### Branch Naming Convention
Linear automatically generates branch names using the format:
```
{username}/{issue-identifier}-{kebab-case-title}
```

Example: `jeremyshields/bus-2-crm-module-customer-database-implementation`

## 📊 Sprint Management

### Sprint Structure
- **Sprint Duration**: 2-6 weeks depending on scope
- **Sprint Planning**: Create sprint epic and break down tasks
- **Daily Standups**: Review progress and update issue status
- **Sprint Review**: Review completed work and demo features
- **Sprint Retrospective**: Identify improvements for next sprint

### Sprint 2 Structure (Current)
- **Epic**: Sprint 2: Core Business Features (Version 0.2.0)
- **Duration**: 6 weeks (August-September 2025)
- **Modules**: CRM, Accounting, Project Management, Reporting, UI/UX

### Issue Organization
- **Epics**: Major features or modules
- **Features**: Specific functionality within modules
- **Tasks**: Individual development tasks
- **Bugs**: Issues found during development or testing

## 🔗 Integration with Development Workflow

### Git Integration
- **Branch Creation**: Linear creates branches automatically
- **Commit Messages**: Use conventional commits
- **Pull Requests**: Link PRs to Linear issues
- **Issue References**: Reference issues in commit messages

### Conventional Commits
```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(crm): add customer database implementation`
- `fix(accounting): resolve invoice calculation bug`
- `docs(api): update GraphQL schema documentation`

### Pull Request Workflow
1. **Create Branch**: Linear creates branch from issue
2. **Develop**: Work on the feature/fix
3. **Create PR**: Link PR to Linear issue
4. **Review**: Code review and testing
5. **Merge**: Merge and close issue

## 📈 Reporting and Metrics

### Sprint Metrics
- **Velocity**: Story points completed per sprint
- **Burndown**: Track progress throughout sprint
- **Cycle Time**: Time from start to completion
- **Lead Time**: Time from creation to completion

### Issue Metrics
- **Resolution Time**: Time to resolve issues
- **Reopened Issues**: Issues that were reopened
- **Bug Rate**: Number of bugs per feature
- **Code Review Time**: Time in In Review and PR Approved statuses
- **Testing Time**: Time in Dev (Localhost) Testing, Dev (Railway) Testing, and Prod Testing statuses
- **Release Readiness**: Time in Ready for Release status

### Team Metrics
- **Capacity**: Team availability and workload
- **Throughput**: Issues completed per time period
- **Quality**: Issues reopened or requiring fixes
- **Satisfaction**: Team feedback on process

## 🎯 Best Practices Summary

### Issue Management
- ✅ Use descriptive, consistent issue titles
- ✅ Include detailed acceptance criteria
- ✅ Estimate story points accurately
- ✅ Set appropriate priority levels
- ✅ Link related issues and dependencies
- ✅ Update issue status regularly
- ✅ Add progress comments and updates

### Workflow
- ✅ Follow the defined status workflow
- ✅ Use conventional commits
- ✅ Link PRs to Linear issues
- ✅ Update issues with progress
- ✅ Review and close issues promptly
- ✅ Use labels for categorization
- ✅ Maintain clean issue descriptions

### Sprint Management
- ✅ Plan sprints with realistic scope
- ✅ Break down epics into manageable tasks
- ✅ Track progress daily
- ✅ Review and retrospect regularly
- ✅ Adjust estimates based on actual performance
- ✅ Communicate blockers and dependencies
- ✅ Celebrate completed work

### Team Collaboration
- ✅ Use Linear for all project communication
- ✅ Add context and details to issues
- ✅ Tag team members when needed
- ✅ Share progress and updates
- ✅ Provide constructive feedback
- ✅ Help teammates when possible
- ✅ Maintain positive team culture

## 🔧 Linear Configuration Recommendations

### Team Settings
- **Issue Templates**: Create templates for common issue types
- **Custom Fields**: Add fields for story points, estimation
- **Automation**: Set up automatic status transitions
- **Integrations**: Connect with GitHub, Slack, etc.

### Project Settings
- **Issue States**: Customize workflow states as needed
- **Labels**: Create project-specific labels
- **Templates**: Create project issue templates
- **Automation**: Set up project-specific automation

### Personal Settings
- **Notifications**: Configure notification preferences
- **Keyboard Shortcuts**: Learn and use shortcuts
- **Views**: Create custom views for different workflows
- **Filters**: Set up useful issue filters

## 📚 Additional Resources

### Linear Documentation
- [Linear Help Center](https://linear.app/help)
- [Linear API Documentation](https://developers.linear.app)
- [Linear Keyboard Shortcuts](https://linear.app/help/shortcuts)
- [Linear Integrations](https://linear.app/integrations)

### Project Documentation
- [Development Plan](./DEVELOPMENT_PLAN.md)
- [Sprint 2 Planning](./SPRINT_2_PLANNING.md)
- [Project Roadmap](./PROJECT_ROADMAP.md)
- [Release Workflow](./RELEASE_WORKFLOW.md)

### External Resources
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Agile Development](https://agilemanifesto.org/)
- [Scrum Guide](https://scrumguides.org/)
- [Story Point Estimation](https://www.mountaingoatsoftware.com/blog/story-points)

---

## 🎊 Sprint 2 Linear Setup Complete

### Created Issues Summary
- **Epic**: Sprint 2: Core Business Features (Version 0.2.0)
- **CRM Module**: 3 issues (Customer Database, Contact Management, Lead Management)
- **Accounting Module**: 3 issues (Chart of Accounts, Transaction Management, Invoice Generation)
- **Project Management**: 3 issues (Project Creation, Task Management, Time Tracking)
- **Reporting & Analytics**: 2 issues (Dashboard, Custom Report Builder)
- **Enhanced UI/UX**: 2 issues (Responsive Design, Advanced Components)

### Total Issues Created: 14
- **High Priority**: 12 issues
- **Medium Priority**: 2 issues
- **Total Story Points**: ~100 points
- **Estimated Duration**: 6 weeks

### Next Steps
1. **Review Issues**: Review all created issues for accuracy
2. **Assign Team Members**: Assign issues to team members
3. **Set Due Dates**: Set realistic due dates for each issue
4. **Create Sprint**: Create Sprint 2 cycle in Linear
5. **Begin Development**: Start working on high-priority issues

---

*Linear Best Practices Guide - Version 1.2 - July 22, 2025*
*Status: Updated with new status workflow, corrected labels, and comprehensive label structure* 

## Automated Issue Title Checks

A GitHub Action is now in place to enforce the required issue title convention:

- **Required Format:** `[Module] Brief description of the feature/task`
- When a new issue is created or edited on GitHub, the action will:
  - Check the title for compliance.
  - If the title does not match, comment on the issue and add a `needs-title-fix` label.
  - When the title is corrected, the label will be removed automatically.
- This helps maintain a clean, searchable, and professional issue tracker.

> **Note:** This automation applies to all issues created or edited on GitHub. For Linear-native issues, please follow the same convention manually.

If you have questions about the correct format, refer to the examples above or ask the project maintainer. 