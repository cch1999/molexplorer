# Refactor Plan: Modern Component Framework and TypeScript

This document outlines a proposal to restructure the Molexplorer codebase for improved maintainability and scalability.

## Component Framework and Centralized State
- Replace the current monolithic initialization logic with a modern component framework such as **React** or **Vue**.
- Introduce a centralized store (e.g., **Redux**, **Vuex**, or **Pinia**) so components like the molecule grid, fragment library, and protein browser share a single source of truth.
- Each view should become its own component, enabling isolated development and testing.

## Declarative Components
- Refactor manual DOM construction (e.g., `MoleculeCard`) into declarative components.
- Leverage JSX or Vue single-file components to reduce boilerplate, encourage reuse, and simplify event handling.

## Service Layer and Dependency Injection
- Convert `ApiService` from static methods and a global cache into an injectable class with a clear interface.
- Dependency injection makes it easier to mock services during testing and to add cross-cutting concerns like retries or logging.

## TypeScript Adoption
- Introduce TypeScript across the codebase.
- Define interfaces for entities such as `Molecule` and `PdbEntry` to enable static type checking.
- Use typed props and generics in components to improve clarity of contracts and API responses.

## Expected Benefits
- Clear separation of concerns and easier onboarding for new contributors.
- Improved maintainability and extensibility as new UI features or API endpoints are added.
- Better testability through isolated components and injected services.
- Greater developer productivity and reliability thanks to strong typing and reusable components.

