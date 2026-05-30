# Contributing to Do Not Blink

Thank you for your interest in contributing to "Do Not Blink" - a web-based staring competition game! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

## Code of Conduct

- Be respectful and constructive in all interactions
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Git

### Local Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/do-not-blink.git
   cd do-not-blink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase (for leaderboard functionality)**
   - Create a free account at [supabase.com](https://supabase.com)
   - Create a new project
   - Run the SQL setup script from `supabase-setup.sql` in your Supabase SQL editor
   - Copy your Supabase URL and anon key
   - Create a `.env` file in the project root:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Allow camera permissions when prompted

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Adding or updating tests

Example: `feature/add-blink-warning-indicator`

### Making Changes

1. Create a new branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the [Coding Standards](#coding-standards)

3. Test your changes thoroughly

4. Commit your changes with clear messages
   ```bash
   git commit -m "feat: add blink warning indicator"
   ```

5. Push to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a Pull Request on GitHub

## Coding Standards

### Svelte/SvelteKit

- Use Svelte 5 syntax and best practices
- Keep components small and focused
- Use stores for shared state
- Follow the existing component structure

### JavaScript

- Use ES6+ features
- Prefer `const` and `let` over `var`
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### CSS

- Use CSS custom properties (variables) for theming
- Follow the existing color palette defined in `app.css`
- Use utility classes from `app.css` when appropriate
- Ensure responsive design (mobile-first approach)

### File Organization

```
src/
├── components/          # Svelte components
│   ├── game/          # Game-related components
│   ├── start/         # Start screen components
│   ├── results/       # Results screen components
│   └── shared/        # Shared components
├── services/          # Business logic and external services
├── stores/            # Svelte stores for state management
├── lib/               # Utility functions and constants
└── app.css           # Global styles and CSS variables
```

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line arrays/objects
- Maximum line length: 100 characters

## Testing

### Manual Testing Checklist

Before submitting a PR, test:

1. **Camera Initialization**
   - Camera permission prompt appears
   - Video feed displays correctly
   - Face tracking works in various lighting conditions

2. **Game Flow**
   - Start screen → Calibration → Countdown → Game → Results
   - All transitions are smooth
   - Timer updates correctly

3. **Blink Detection**
   - Game ends when you blink
   - Game doesn't end when you move your head
   - Warning indicator appears when eyes start closing

4. **Leaderboard**
   - Scores submit correctly
   - Leaderboard displays properly
   - Guest and authenticated users work

5. **Responsiveness**
   - Test on mobile devices
   - Test on different screen sizes
   - Touch interactions work

### Browser Compatibility

Test on:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Submitting Changes

### Pull Request Guidelines

1. **Title**: Use conventional commit format
   - `feat:` for new features
   - `fix:` for bug fixes
   - `refactor:` for code refactoring
   - `docs:` for documentation changes

2. **Description**: Include:
   - What changes were made and why
   - How you tested the changes
   - Screenshots for UI changes (if applicable)
   - Any breaking changes

3. **Checklist**:
   - [ ] Code follows the project's coding standards
   - [ ] Changes have been tested manually
   - [ ] Documentation has been updated (if needed)
   - [ ] No console errors or warnings
   - [ ] Responsive on mobile devices

### Review Process

- Maintainers will review your PR within a few days
- Address any feedback or requested changes
- Once approved, your PR will be merged

## Getting Help

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Check existing issues and discussions first

## Recognition

Contributors will be recognized in the project's contributors section. Thank you for helping make "Do Not Blink" better!

---

**Note**: This project is open to contributors of all experience levels. Don't hesitate to ask questions or submit PRs, even if you're new to open source. We're here to help!
