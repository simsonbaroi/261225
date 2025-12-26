# Contributing to Hospital Bill Calculator

Thank you for your interest in contributing to the Hospital Bill Calculator! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- Basic knowledge of React, TypeScript, and Express.js

### Setting Up Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/hospital-bill-calculator.git
   cd hospital-bill-calculator
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5000` in your browser

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code formatting (Prettier configuration included)
- Use meaningful variable and function names
- Add comments for complex logic
- Prefer functional components and hooks in React

### Commit Messages

Follow conventional commit format:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example: `feat: add patient search functionality`

### Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation updates
- `refactor/component-name` - Refactoring

### Testing

- Write tests for new features
- Ensure existing tests pass
- Test both frontend and backend functionality
- Test responsive design on different screen sizes

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── main.tsx        # Application entry point
├── server/                 # Express.js backend
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   ├── aiRoutes.ts         # AI analytics endpoints
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
├── mobile/                 # React Native mobile app
└── docs/                   # Documentation
```

## Contributing Process

### 1. Choose an Issue

- Check the [Issues](https://github.com/yourusername/hospital-bill-calculator/issues) page
- Look for issues labeled `good first issue` for beginners
- Comment on the issue to let others know you're working on it

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes

- Write clean, documented code
- Follow the existing code style
- Test your changes thoroughly
- Update documentation if needed

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title and description
- Reference to related issues
- Screenshots if UI changes are involved

### 6. Code Review

- Respond to feedback promptly
- Make requested changes
- Keep the PR updated with the main branch

## Types of Contributions

### Bug Reports

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/OS information

### Feature Requests

For new features, please:
- Check if the feature already exists
- Describe the use case
- Explain why it would be valuable
- Consider the implementation complexity

### Code Contributions

Areas where contributions are welcome:
- New medical billing features
- UI/UX improvements
- Performance optimizations
- Mobile app enhancements
- AI analytics improvements
- Documentation updates
- Test coverage improvements

### Documentation

Help improve documentation by:
- Fixing typos and errors
- Adding examples
- Improving clarity
- Translating to other languages

## Technical Considerations

### Database Schema

When modifying the database schema:
- Update `shared/schema.ts`
- Create migration scripts if needed
- Update API documentation
- Test with sample data

### API Changes

For API modifications:
- Update `server/routes.ts`
- Maintain backward compatibility when possible
- Update API documentation
- Add validation with Zod schemas

### Frontend Components

When adding UI components:
- Use shadcn/ui components when possible
- Follow the glass morphism design theme
- Ensure responsive design
- Add proper TypeScript types

### Mobile App

For React Native contributions:
- Test on both iOS and Android
- Follow platform-specific guidelines
- Maintain feature parity with web app
- Update mobile documentation

## Security

### Reporting Security Issues

Please report security vulnerabilities privately by emailing the maintainers. Do not create public issues for security problems.

### Security Guidelines

- Never commit sensitive data (API keys, passwords)
- Use environment variables for configuration
- Validate all user inputs
- Follow OWASP security practices

## Community Guidelines

### Be Respectful

- Use inclusive language
- Respect different opinions and approaches
- Provide constructive feedback
- Help newcomers learn

### Communication

- Use GitHub issues for bug reports and feature requests
- Use discussions for questions and general topics
- Be clear and concise in communications
- Provide context when asking for help

## Release Process

1. Features are merged into `main` branch
2. Version numbers follow semantic versioning
3. Releases are tagged and documented
4. Changes are deployed to production

## Getting Help

- Check existing documentation
- Search closed issues for similar problems
- Ask questions in GitHub discussions
- Contact maintainers if needed

## Recognition

Contributors will be:
- Listed in the project's contributors section
- Acknowledged in release notes for significant contributions
- Invited to become maintainers for consistent valuable contributions

Thank you for contributing to the Hospital Bill Calculator! Your help makes this project better for everyone.