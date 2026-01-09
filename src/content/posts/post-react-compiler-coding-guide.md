---
title: "Post-React Compiler React Coding Guide (For AI Agents)"
excerpt: 'A comprehensive guide for AI agents generating React code in environments with React Compiler, focusing on simplicity, readability, and compiler-friendly patterns.'
publishDate: 2026-01-09
tags: ['react', 'compiler', 'ai', 'performance', 'hooks', 'frontend', 'best-practices']
---

> **Audience**: AI agents generating React code targeting environments where the React Compiler (or equivalent automatic memoization / reactive analysis) is enabled.
>
> **Goal**: Produce React code that is **simple, readable, declarative, and compiler-friendly**, avoiding legacy performance patterns that are now either unnecessary or harmful.

---

## 1. Mental Model Shift

### Pre-Compiler React (Legacy Model)

* Developers manually controlled re-renders.
* `useMemo`, `useCallback`, and `memo` were used defensively.
* Referential equality was a primary performance concern.
* Code was structured around *avoiding renders*.

### Post-Compiler React (Modern Model)

* The compiler analyzes component behavior and inserts memoization automatically.
* Renders are cheap; *unnecessary complexity is expensive*.
* Code should be structured around **clarity and correctness**, not render avoidance.
* The compiler, not the author, owns optimization.

> **Rule of Thumb**: Write React as if every render is free and memoization is automatic.

---

## 2. Core Principles

### 2.1 Prefer Plain JavaScript

* Use normal variables, functions, and expressions.
* Avoid wrapping logic in hooks unless semantically required.

**Good**

```jsx
const total = items.reduce((sum, i) => sum + i.price, 0)
```

**Avoid**

```jsx
const total = useMemo(() => items.reduce((sum, i) => sum + i.price, 0), [items])
```

---

### 2.2 Avoid Manual Memoization by Default

Do **not** introduce:

* `useMemo`
* `useCallback`
* `React.memo`

…unless one of the following is true:

* You are integrating with **non-React systems** (event listeners, subscriptions, imperative APIs).
* The value must be **referentially stable across renders for correctness**, not performance.

> Memoization for performance is the compiler's job.

---

### 2.3 Treat Components as Pure Functions

Components should:

* Derive UI purely from props, state, and context.
* Avoid hidden mutable state.
* Avoid observable side effects during render.

**Good**

```jsx
function Price({ value }) {
  return <span>{value.toFixed(2)}</span>
}
```

**Avoid**

```jsx
let cached
function Price({ value }) {
  cached ??= value.toFixed(2)
  return <span>{cached}</span>
}
```

---

## 3. Hooks Usage Guidelines

### 3.1 `useState`

* Use for true local UI state.
* Prefer multiple small states over one large object.

**Good**

```jsx
const [open, setOpen] = useState(false)
const [count, setCount] = useState(0)
```

---

### 3.2 `useEffect`

* Use only for **effects**, not derivations.
* Effects synchronize React with the outside world.

**Good**

```jsx
useEffect(() => {
  document.title = title
}, [title])
```

**Avoid**

```jsx
const [derived, setDerived] = useState()
useEffect(() => {
  setDerived(a + b)
}, [a, b])
```

Derive values inline instead.

---

### 3.3 `useRef`

* Use for:

  * Imperative handles
  * Mutable values that do **not** affect rendering

**Avoid** using `useRef` as a memoization cache.

---

## 4. Props and Data Flow

### 4.1 Prefer Passing Values, Not Callbacks

Callbacks increase indirection and were historically memoized.

**Good**

```jsx
<Dialog open={open} onClose={() => setOpen(false)} />
```

**Avoid Over-Engineering**

```jsx
const onClose = useCallback(() => setOpen(false), [])
<Dialog open={open} onClose={onClose} />
```

The compiler can handle inline closures.

---

### 4.2 Lift State Only When Semantically Necessary

* Do not lift state purely for performance.
* Lift state when multiple components need to *coordinate*.

---

## 5. Lists and Keys

* Keys must be **stable and semantic**, not index-based.
* Do not optimize list rendering with memoization.

**Good**

```jsx
items.map(item => <Row key={item.id} item={item} />)
```

---

## 6. Derived Data

### Rule: Derive, Don't Store

* Never store derived data in state.
* Compute it directly during render.

**Good**

```jsx
const visibleItems = items.filter(i => i.visible)
```

**Avoid**

```jsx
const [visibleItems, setVisibleItems] = useState([])
```

---

## 7. Error Boundaries and Suspense

* Treat `Suspense` as a **control-flow primitive**, not a performance trick.
* Do not prematurely split components for loading states.

---

## 8. When Manual Optimization *Is* Allowed

Manual optimization is acceptable when:

* Profiling shows a real bottleneck **after** compilation.
* Interfacing with legacy or non-React systems.
* Referential stability is required for correctness (e.g., effect dependencies, subscriptions).
* You need **precise control over effect re-execution**, beyond what the compiler infers.

In these cases:

* Treat `useMemo`, `useCallback`, and `React.memo` as **escape hatches**, not defaults.
* Document *why* memoization exists.
* Scope it as narrowly as possible.

---

## 9. Compiler Configuration, Compilation Modes & Directives (Critical for AI Agents)

### 9.1 Compilation Modes (`compilationMode`)

React Compiler behavior depends on the configured **compilation mode**. AI-generated code must be correct under *all* modes.

Supported modes:

* **`infer` (default)**

  * Compiler heuristically detects React components and hooks.
  * PascalCase + JSX → component inference.
  * `use*` prefix + hook usage → hook inference.
  * This is the most common mode.

* **`annotation`**

  * Only functions explicitly annotated with `"use memo"` are compiled.
  * Used for incremental adoption and safety.
  * AI agents must not assume compilation unless annotations are present.

* **`syntax`**

  * Relies on Flow-specific component syntax.
  * Rare in TypeScript codebases.

* **`all`**

  * Attempts to compile all top-level functions.
  * Generally discouraged due to unpredictability.
  * Opt-out directives become especially important.

**AI Rules**:

* Assume `infer` unless explicitly told otherwise.
* Never rely on compilation for correctness.
* Follow naming conventions to aid inference.

---

### 9.2 Rules of Inference (How the Compiler Decides What to Optimize)

The compiler infers intent based on structure and naming:

* PascalCase + JSX ⇒ Component
* `useX` + hook usage ⇒ Hook
* Everything else ⇒ Possibly ignored unless annotated

AI agents must:

* Use standard naming conventions.
* Avoid ambiguous helper functions that resemble components.
* Not depend on inference for semantics.

---

### 9.3 Compiler Directives

React Compiler directives control *whether* code is compiled — not *how fast* it runs.

#### `"use memo"`

* Explicitly opts a function or file **into** compilation.
* Required in `annotation` mode.
* Rarely needed in `infer` mode.

#### `"use no memo"`

* Explicitly opts a function or file **out of** compilation.
* Takes precedence over all compilation modes.
* Equivalent to disabling the compiler for that scope.

**Guidelines for AI Agents**:

* Never introduce directives automatically.
* Respect existing directives.
* Use `"use no memo"` only as a last-resort escape hatch.
* Always document why an opt-out exists.

> Directives define **compiler trust boundaries**, not performance hints.

---

## 10. Code Style Expectations for AI Agents

AI-generated React code should:

* Prefer readability over cleverness.
* Avoid defensive patterns from pre-compiler React.
* Minimize hooks usage.
* Avoid comments explaining memoization or render behavior unless strictly required.

> If you feel the need to explain why a hook is used, reconsider whether it is needed.

---

## 11. Summary Rules (Checklist)

* ❌ Do not use `useMemo` / `useCallback` by default
* ❌ Do not store derived state
* ❌ Do not optimize renders manually
* ✅ Write components as pure functions
* ✅ Derive values inline
* ✅ Use hooks only for semantics, not performance
* ✅ Trust the compiler

---

**Final Principle**:

> *In post-React Compiler React, performance is an implementation detail. Semantics are the API.*
