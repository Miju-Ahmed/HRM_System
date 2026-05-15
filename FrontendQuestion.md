# Frontend Angular Interview Questions (HRMS Project Context)

This document contains a curated list of frontend interview questions tailored specifically to the architecture, technologies (Angular 17), and implementation details of this HRMS frontend project.

---

## 1. Angular Fundamentals

**Q: What is Angular, and why was it chosen for this HRMS?**
* **Context**: Explain that Angular is a component-based framework for building robust Single Page Applications (SPAs). It was chosen for its strong typing with TypeScript, built-in routing, HTTP client, and modular architecture, which are ideal for large enterprise applications like an HRMS.

**Q: Explain the basic building blocks of an Angular application.**
* **Context**: Discuss Components, Modules (or Standalone Components in Angular 14+), Templates, Directives, Services, and Dependency Injection.

**Q: What are Standalone Components in Angular 14+ / 17, and are they used in this project?**
* **Context**: Explain how Standalone Components eliminate the need for `NgModules`, simplifying the application structure and making lazy loading easier.

**Q: Describe the Component Lifecycle Hooks in Angular.**
* **Context**: Discuss `ngOnInit`, `ngOnChanges`, `ngDoCheck`, `ngAfterViewInit`, and `ngOnDestroy`. Explain when to use `ngOnInit` (e.g., fetching initial data like the employee list) vs `ngOnDestroy` (e.g., unsubscribing from observables to prevent memory leaks).

---

## 2. Data Binding & Directives

**Q: What is Data Binding in Angular? Explain the different types.**
* **Context**: Discuss one-way data binding (Interpolation `{{}}` and Property Binding `[]`), Event Binding `()`, and two-way data binding `[(ngModel)]`. Provide examples of how these are used in the HRMS forms (like login or adding an employee).

**Q: What is the difference between Structural and Attribute Directives?**
* **Context**: Explain that Structural Directives (`*ngIf`, `*ngFor`) change the DOM layout, while Attribute Directives (`ngClass`, `ngStyle`) change the appearance or behavior of an element. Give an example like using `*ngIf` to show/hide the Admin dashboard elements based on the user's role.

**Q: How does Angular 17's new Control Flow (`@if`, `@for`) differ from `*ngIf` and `*ngFor`?**
* **Context**: Explain the performance benefits and cleaner syntax of the new built-in control flow in Angular 17.

---

## 3. Services, Dependency Injection & RxJS

**Q: What is a Service in Angular, and what is its purpose in this project?**
* **Context**: Discuss how services (e.g., `AuthService`, `EmployeeService`) are used to share logic across components, manage state, and handle HTTP requests to the .NET Core backend.

**Q: Explain Dependency Injection (DI) in Angular.**
* **Context**: Explain how the `@Injectable({ providedIn: 'root' })` decorator works and how Angular's DI framework instantiates and provides services to components.

**Q: What is RxJS, and why is it heavily used in Angular?**
* **Context**: Describe RxJS as a library for reactive programming using Observables. It handles asynchronous operations like HTTP requests and event handling.

**Q: Explain the difference between an Observable and a Promise.**
* **Context**: Highlight that Observables are lazy, can emit multiple values over time, and are cancelable, whereas Promises execute immediately, emit a single value, and cannot be canceled.

**Q: What are RxJS Operators? Name a few commonly used ones.**
* **Context**: Discuss operators like `map`, `filter`, `catchError`, `tap`, and `switchMap`. Explain how `catchError` is used in HTTP calls to handle backend errors globally.

---

## 4. Routing & Guards

**Q: How does Routing work in an Angular SPA?**
* **Context**: Explain how the `RouterModule` (or `provideRouter`) allows navigating between different views (e.g., `/login`, `/admin-dashboard`, `/employee-profile`) without reloading the page.

**Q: What are Route Guards, and how are they used in this HRMS?**
* **Context**: Discuss `CanActivate` guards. Explain how an `AuthGuard` prevents unauthenticated users from accessing the dashboard, and a `RoleGuard` prevents an Employee from accessing the HR or Admin routes.

**Q: What is Lazy Loading, and why is it beneficial?**
* **Context**: Explain that lazy loading delays the loading of modules/components until the route is actually visited, which significantly reduces the initial bundle size and improves load time.

---

## 5. Forms & Validation

**Q: What is the difference between Template-Driven Forms and Reactive Forms?**
* **Context**: Reactive Forms (built in the component class) are more robust, scalable, and easier to test. Template-Driven Forms are simpler but rely heavily on HTML directives. This HRMS likely uses Reactive Forms for complex data entry like adding an employee or processing payroll.

**Q: How do you implement form validation in Angular Reactive Forms?**
* **Context**: Discuss the use of `Validators.required`, `Validators.email`, `Validators.minLength`, and custom validators. Explain how validation errors are displayed in the UI.

---

## 6. Authentication & Interceptors

**Q: How is JWT Authentication handled on the frontend?**
* **Context**: Describe the flow: The user logs in, receives a JWT from the backend, stores it in `localStorage` or `sessionStorage`, and includes it in subsequent requests.

**Q: What is an HTTP Interceptor?**
* **Context**: Explain that an interceptor catches incoming or outgoing HTTP requests. In this project, an `AuthInterceptor` is used to automatically attach the `Authorization: Bearer <token>` header to every outgoing request to the backend API.

---

## 7. State Management & Advanced Concepts

**Q: How do you share data between components?**
* **Context**: 
  - Parent to Child: `@Input()`
  - Child to Parent: `@Output()` and `EventEmitter`
  - Unrelated components: A shared Service using `Subject` or `BehaviorSubject`.

**Q: What is the difference between `Subject` and `BehaviorSubject` in RxJS?**
* **Context**: Explain that a `BehaviorSubject` requires an initial value and always emits its current/latest value to new subscribers, which is useful for storing state like the currently logged-in user.

**Q: What is Content Projection in Angular?**
* **Context**: Explain how `<ng-content>` is used to create reusable components (like modals or cards) where the parent component can inject HTML content into the child component.

---

## 8. TypeScript Basics

**Q: What is TypeScript, and how does it relate to JavaScript?**
* **Context**: TypeScript is a strongly typed superset of JavaScript that compiles down to plain JavaScript.

**Q: What is an Interface in TypeScript?**
* **Context**: Explain how interfaces are used to define contracts for data structures, such as creating an `Employee` interface that matches the backend DTO structure to ensure type safety.

**Q: What are access modifiers in TypeScript?**
* **Context**: Discuss `public`, `private`, and `protected`, and how they are used in classes.

---

## 9. HTML Basics (1-10)
1. **What does HTML stand for?**
2. **What is the difference between an element and a tag in HTML?**
3. **What are semantic HTML tags, and why are they important?**
4. **What is the purpose of the `alt` attribute on an `<img>` tag?**
5. **What is the difference between `id` and `class` attributes?**
6. **Explain the difference between `<div>` and `<span>`.**
7. **What is a form in HTML, and what are its standard HTTP methods?**
8. **What are HTML5 data attributes (`data-*`)?**
9. **How do you include external CSS and JavaScript files in HTML?**
10. **What is the DOM (Document Object Model)?**

## 10. CSS Basics & UI/UX (11-20)
11. **What is the CSS Box Model?**
12. **Explain the difference between `margin` and `padding`.**
13. **What are the different types of CSS selectors?** (Class, ID, Tag, Universal, Pseudo-classes)
14. **What is Flexbox, and how does it compare to CSS Grid?**
15. **What is a CSS Preprocessor like SASS or SCSS?**
16. **What does the `z-index` property do?**
17. **What are Media Queries, and why are they used?**
18. **Explain the difference between `display: none` and `visibility: hidden`.**
19. **What are CSS variables (Custom Properties)?**
20. **Explain the concepts of relative, absolute, fixed, and sticky positioning.**

## 11. JavaScript Basics (21-40)
21. **What are the basic data types in JavaScript?**
22. **What is the difference between `let`, `const`, and `var`?**
23. **What is hoisting in JavaScript?**
24. **Explain the concept of closures.**
25. **What is the difference between `==` and `===`?**
26. **What is `NaN` in JavaScript?**
27. **How does the `this` keyword work in JavaScript?**
28. **What is an arrow function, and how does it affect `this`?**
29. **What is the difference between `null` and `undefined`?**
30. **Explain event delegation in JavaScript.**
31. **What is event bubbling and event capturing?**
32. **What are JavaScript arrays and name 5 common array methods?**
33. **Explain the `map()`, `filter()`, and `reduce()` array methods.**
34. **What is a JavaScript object?**
35. **What is object destructuring?**
36. **What are template literals?**
37. **What is the spread operator (`...`) and rest parameter?**
38. **Explain the concept of a Promise in JavaScript.**
39. **What are `async` and `await`?**
40. **What is the Event Loop in JavaScript?**

## 12. Advanced JavaScript & ES6+ (41-60)
41. **What is a Higher-Order Function?**
42. **What is currying in JavaScript?**
43. **Explain deep copy vs. shallow copy.**
44. **What is the difference between `Object.freeze()` and `const`?**
45. **What are JavaScript modules (`import` and `export`)?**
46. **What is strict mode (`"use strict"`)?**
47. **How does JavaScript handle garbage collection?**
48. **What is Web Storage (LocalStorage and SessionStorage)?**
49. **What are cookies, and how do they differ from Web Storage?**
50. **What is the Fetch API?**
51. **Explain the concept of debouncing and throttling.**
52. **What is a pure function?**
53. **What are JavaScript Generators?**
54. **What is a Proxy object in JavaScript?**
55. **What are `Map` and `Set` in JavaScript?**
56. **Explain prototypical inheritance in JavaScript.**
57. **How do you handle errors using `try...catch`?**
58. **What is the purpose of the `finally` block?**
59. **What is JSON, and how do you parse and stringify it?**
60. **What are memory leaks, and how do you avoid them in JavaScript?**

## 13. TypeScript (61-70)
61. **What are generics in TypeScript?**
62. **What is the difference between an `interface` and a `type` alias?**
63. **Explain Enums in TypeScript.**
64. **What are Union and Intersection types?**
65. **What is type assertion (type casting) in TypeScript?**
66. **What is the `any` type, and why should it be avoided?**
67. **What is the `unknown` type, and how does it differ from `any`?**
68. **What are Tuple types?**
69. **Explain utility types like `Partial<T>`, `Readonly<T>`, and `Omit<T, K>`.**
70. **What is a Decorator in TypeScript?**

## 14. Angular Core (71-85)
71. **What is an Angular Workspace vs. an Angular Project?**
72. **What is the `angular.json` file used for?**
73. **How does change detection work in Angular?**
74. **What is the difference between `Default` and `OnPush` change detection strategies?**
75. **What is a Pipe in Angular? Give examples of built-in pipes.**
76. **How do you create a custom Pipe?**
77. **What is a Directive? Explain Component, Structural, and Attribute Directives.**
78. **What is Angular Universal (Server-Side Rendering)?**
79. **What is the `NgModel` directive, and which module is required for it?**
80. **What is a reactive form `FormGroup` vs. `FormControl` vs. `FormArray`?**
81. **What are Route Parameters and Query Parameters?**
82. **How do you pass data through routes in Angular?**
83. **What is an Angular Environment file?**
84. **Explain the use of `trackBy` in an `*ngFor` loop.**
85. **What is the `ViewChild` and `ContentChild` decorator?**

## 15. RxJS & State Management (86-100)
86. **What is an Observer and a Subscription in RxJS?**
87. **How do you handle multiple HTTP requests in parallel using RxJS?** (e.g., `forkJoin`)
88. **What is the `switchMap` operator, and when is it preferred over `mergeMap`?**
89. **What is the `takeUntil` operator used for?**
90. **What is the `debounceTime` operator?**
91. **What is a `ReplaySubject`?**
92. **What is the `async` pipe, and why is it beneficial?**
93. **What is NgRx, and what problem does it solve?**
94. **What are the core concepts of NgRx (Store, Actions, Reducers, Selectors, Effects)?**
95. **What is an NgRx Effect?**
96. **How does state management differ in small vs. large Angular applications?**
97. **What is a Signal in Angular 16+?**
98. **How do Signals differ from RxJS Observables?**
99. **What is the `computed()` function in Angular Signals?**
100. **What is an `effect()` in Angular Signals?**
