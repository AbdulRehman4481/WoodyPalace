<!--
Sync Impact Report:
Version change: 0.0.0 → 1.0.0
Modified principles: All principles replaced with Next.js 15 and modular code principles
Added sections: Next.js 15 Best Practices, Code Organization Standards, Performance Standards
Removed sections: None (template was empty)
Templates requiring updates: 
  ✅ plan-template.md (updated constitution check section)
  ✅ spec-template.md (updated for Next.js project structure)
  ✅ tasks-template.md (updated for Next.js development workflow)
Follow-up TODOs: None
-->

# MyApp Constitution

## Core Principles

### I. Modular Architecture (NON-NEGOTIABLE)
Every component, service, and utility MUST be self-contained and independently testable. 
Components must have single responsibility, clear interfaces, and minimal dependencies. 
Use composition over inheritance, dependency injection, and explicit contracts between modules.

### II. Next.js 15 App Router Standards
MUST use App Router exclusively (not Pages Router). All routes defined in `app/` directory 
with proper `layout.tsx`, `page.tsx`, and `loading.tsx` files. Server Components by default, 
Client Components only when necessary with explicit "use client" directive.

### III. TypeScript-First Development
All code MUST be written in TypeScript with strict type checking enabled. 
No `any` types allowed without explicit justification. Use proper interfaces, 
type guards, and generic constraints. Leverage Next.js built-in TypeScript support.

### IV. Performance-First Approach
MUST implement Core Web Vitals optimization: LCP < 2.5s, FID < 100ms, CLS < 0.1. 
Use Next.js Image optimization, dynamic imports, and proper caching strategies. 
Implement proper loading states and error boundaries.

### V. Test-Driven Development
TDD mandatory: Tests written → User approved → Tests fail → Then implement. 
Red-Green-Refactor cycle strictly enforced. Unit tests for utilities, 
integration tests for API routes, and E2E tests for critical user journeys.

## Next.js 15 Best Practices

### Server Components Priority
Default to Server Components for better performance and SEO. Use Client Components 
only for interactivity, browser APIs, or state management. Properly separate 
server and client boundaries with clear data flow.

### File-Based Routing
Follow Next.js 15 conventions: `app/` directory structure, route groups `(group)`, 
parallel routes `@folder`, intercepting routes `(.)`, and dynamic routes `[id]`. 
Use proper metadata API for SEO optimization.

### Data Fetching Patterns
Use Server Actions for mutations, proper caching with `revalidateTag` and 
`revalidatePath`. Implement proper error handling with `error.tsx` files. 
Use Suspense boundaries for loading states.

## Code Organization Standards

### Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route groups
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── features/         # Feature-specific components
├── lib/                  # Utilities and configurations
│   ├── utils.ts          # Pure utility functions
│   ├── validations.ts    # Zod schemas
│   └── constants.ts      # App constants
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── styles/               # Additional styling
```

### Component Standards
Components MUST be functional, use proper TypeScript interfaces, and follow 
single responsibility principle. Use proper prop validation with Zod schemas. 
Implement proper error boundaries and loading states.

## Performance Standards

### Core Web Vitals Compliance
- Largest Contentful Paint (LCP): < 2.5 seconds
- First Input Delay (FID): < 100 milliseconds  
- Cumulative Layout Shift (CLS): < 0.1
- First Contentful Paint (FCP): < 1.8 seconds

### Optimization Requirements
- Image optimization with Next.js Image component
- Code splitting with dynamic imports
- Proper caching strategies (ISR, SSG, SSR)
- Bundle size monitoring and optimization
- Proper loading states and skeleton screens

## Development Workflow

### Code Quality Gates
- ESLint with Next.js config must pass
- TypeScript strict mode compliance
- Prettier formatting enforcement
- Husky pre-commit hooks for quality checks
- Automated testing in CI/CD pipeline

### Review Process
All PRs must include: proper TypeScript types, test coverage, performance impact 
assessment, and accessibility compliance. Code reviews must verify Next.js 15 
best practices and modular architecture principles.

## Governance

Constitution supersedes all other practices. Amendments require documentation, 
approval, and migration plan. All PRs/reviews must verify compliance with these 
principles. Complexity must be justified with performance and maintainability 
benefits. Use this constitution for all development guidance.

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27