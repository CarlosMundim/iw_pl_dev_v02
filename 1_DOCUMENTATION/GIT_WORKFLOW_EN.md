# Git Workflow Guide

## Branching Strategy

We use a modified Git Flow strategy optimised for continuous deployment.

### Branch Types

* **main**: Production-ready code
* **develop**: Integration branch for features
* **feature/**\*: New features and enhancements
* **bugfix/**\*: Bug fixes for develop branch
* **hotfix/**\*: Critical fixes for production
* **release/**\*: Release preparation

### Branch Naming Convention

```bash
# Features
feature/user-authentication
feature/ai-matching-algorithm
feature/mobile-app-onboarding

# Bug fixes
bugfix/login-redirect-issue
bugfix/database-connection-timeout

# Hotfixes
hotfix/security-vulnerability-fix
hotfix/payment-processing-error

# Releases
release/v1.2.0
release/v1.2.1
```

---

## Workflow Process

### Feature Development

```bash
# 1. Start from develop branch
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/new-matching-algorithm

# 3. Work on feature with regular commits
git add .
git commit -m "feat: add initial matching algorithm structure"
git commit -m "feat: implement skill-based matching logic"
git commit -m "test: add unit tests for matching algorithm"

# 4. Push feature branch
git push origin feature/new-matching-algorithm

# 5. Create Pull Request to develop
# 6. After review and approval, merge to develop
# 7. Delete feature branch
git branch -d feature/new-matching-algorithm
```

### Release Process

```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. Update version numbers and changelog
# 3. Test release candidate
# 4. Create PR to main
# 5. After approval, merge to main
# 6. Tag the release
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0

# 7. Merge back to develop
git checkout develop
git merge release/v1.2.0
```

### Hotfix Process

```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# 2. Make the fix
git commit -m "fix: resolve critical security vulnerability"

# 3. Create PR to main
# 4. After approval, merge to main and tag
git tag -a v1.2.1 -m "Hotfix version 1.2.1"

# 5. Merge back to develop
git checkout develop
git merge hotfix/critical-security-fix
```

---

## Commit Message Convention

We follow the Conventional Commits specification:

### Format

```
type(scope): description

[optional body]

[optional footer]
```

### Types

* **feat**: New feature
* **fix**: Bug fix
* **docs**: Documentation changes
* **style**: Code style changes (formatting, etc.)
* **refactor**: Code refactoring
* **test**: Adding or updating tests
* **chore**: Maintenance tasks

### Examples

```bash
feat(auth): add OAuth2 authentication
fix(api): resolve database connection timeout
docs(readme): update installation instructions
style(frontend): format React components
refactor(matching): optimise algorithm performance
test(api): add integration tests for user endpoints
chore(deps): update Node.js dependencies
```

---

## Pull Request Guidelines

### PR Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Include screenshots of UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No merge conflicts
```

### Review Process

1. **Automated Checks**: CI/CD pipeline must pass
2. **Code Review**: At least one team member review
3. **Testing**: All tests must pass
4. **Documentation**: Update docs if needed
5. **Approval**: Required before merging

---

## Git Hooks

### Pre-commit Hook

```bash
#!/bin/sh
# Run linting and tests before commit
npm run lint
npm run test:unit
```

### Pre-push Hook

```bash
#!/bin/sh
# Run full test suite before push
npm run test
npm run build
```

---

## Best Practices

1. **Small Commits**: Make atomic, focused commits
2. **Clear Messages**: Write descriptive commit messages
3. **Regular Pushes**: Push work frequently to backup
4. **Clean History**: Use interactive rebase to clean up
5. **No Direct Pushes**: Always use pull requests
6. **Stay Updated**: Regularly sync with upstream branches
