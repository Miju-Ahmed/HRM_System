# Backend .NET Interview Questions (HRMS Project Context)

This document contains a curated list of .NET and backend interview questions tailored specifically to the architecture, technologies, and implementation details of this HRMS ASP.NET Core Web API project.

---

## 1. ASP.NET Core & Web API Fundamentals

**Q: Can you explain the role of `Program.cs` in an ASP.NET Core application?**
* **Context**: In this project, `Program.cs` handles dependency injection container setup, database registration, JWT authentication configuration, and sets up the HTTP request pipeline (middleware).

**Q: How is Dependency Injection (DI) utilized in this HRMS API?**
* **Context**: Explain how services, `AppDbContext`, and Identity managers (`UserManager`, `RoleManager`) are registered in the DI container (e.g., `AddDbContext`, `AddIdentity`) and injected into controllers.

**Q: What is CORS, and how is it configured in this project?**
* **Context**: Discuss why CORS (Cross-Origin Resource Sharing) is needed to allow the Angular frontend (running on `http://localhost:4200`) to communicate with the Web API.

**Q: What is the middleware pipeline in ASP.NET Core? Which standard middlewares are used in this project?**
* **Context**: Mention the sequence of middlewares like `UseCors()`, `UseAuthentication()`, `UseAuthorization()`, and `MapControllers()`, and why their order matters.

---

## 2. Entity Framework Core (EF Core)

**Q: What is the "Code-First" approach in EF Core, and why was it chosen for this HRMS?**
* **Context**: Explain how C# domain models (like `Employee`, `Salary`) are created first, and how EF Core generates the database schema (SQLite) based on those models.

**Q: How do EF Core Migrations work?**
* **Context**: Discuss the commands used (`Add-Migration`, `Update-Database` or `dotnet ef`) to apply incremental schema changes to the SQLite database.

**Q: How is the "Soft Delete" pattern implemented in this application?**
* **Context**: Explain the `AuditEntity` base class (`IsDeleted` flag) and how **Global Query Filters** (`builder.Entity<Employee>().HasQueryFilter(e => !e.IsDeleted);`) ensure deleted records are automatically excluded from `DbContext` queries.

**Q: Describe the difference between Data Annotations and Fluent API in EF Core. Can you provide an example from `AppDbContext.cs`?**
* **Context**: Highlight how Fluent API is used in `OnModelCreating` to configure decimal precision (`18,2`), set up the self-referencing hierarchy for `Department`, and configure the `1-to-1` relationship between `AppUser` and `Employee`.

**Q: What is the difference between Lazy Loading, Eager Loading, and Explicit Loading in EF Core?**
* **Context**: Explain how `.Include()` and `.ThenInclude()` are used for Eager Loading in this project to fetch related data (e.g., getting an Employee and their related Salary record in a single query).

---

## 3. Authentication & Authorization

**Q: How does JWT (JSON Web Token) authentication work in this API?**
* **Context**: Describe the token generation process upon login, how the token is signed with a symmetric key, and how the `[Authorize]` attribute validates the Bearer token on incoming requests.

**Q: What is ASP.NET Core Identity, and how is it integrated here?**
* **Context**: Explain the use of `AppUser` inheriting from `IdentityUser`, and how it interacts with the database. Mention the `UserManager<AppUser>` and `RoleManager<IdentityRole>` services.

**Q: How is Role-Based Access Control (RBAC) enforced in the system?**
* **Context**: Discuss how roles (Admin, HR, Employee) are seeded into the database and how controllers/endpoints restrict access using attributes like `[Authorize(Roles = "Admin, HR")]`.

---

## 4. Advanced C# & Architectural Concepts

**Q: What is the difference between `IEnumerable`, `ICollection`, and `IQueryable`?**
* **Context**: Explain when to use `IQueryable` (when building LINQ queries that are translated to SQL by EF Core) versus `IEnumerable` (in-memory iteration).

**Q: What are Data Transfer Objects (DTOs), and why are they important?**
* **Context**: Discuss why exposing raw domain entities directly to the API endpoints is a bad practice (e.g., exposing the `AppUser` password hash or over-posting vulnerabilities), and how DTOs solve this.

**Q: How does the system handle database initialization and seeding?**
* **Context**: Explain the startup logic where `db.Database.MigrateAsync()` applies pending migrations, and `DbSeeder.SeedAsync()` injects default roles, an admin user, and sample departments into the database on the very first run.

**Q: How do you handle exceptions globally in an ASP.NET Core Web API?**
* **Context**: Discuss approaches to avoid `try-catch` blocks in every controller method, such as using global exception handling middleware or exception filters to return standardized JSON error responses.

---

## 5. API Security & Best Practices

**Q: How does EF Core protect against SQL Injection attacks?**
* **Context**: Explain how EF Core uses parameterized queries by default, meaning user inputs are treated as parameters rather than executable SQL strings, thereby mitigating SQL Injection.

**Q: How are user passwords stored in this HRMS?**
* **Context**: Discuss how ASP.NET Core Identity automatically hashes passwords using PBKDF2 with HMAC-SHA256 (by default) rather than storing them in plain text.

**Q: What is the purpose of token expiration and refresh tokens in JWT authentication?**
* **Context**: Explain why JWT tokens have an expiration time (`ValidateLifetime = true`) to minimize the window of opportunity if a token is compromised, and the concept of how a refresh token could be implemented to get a new access token without re-authenticating.

---

## 6. Performance & Asynchronous Programming

**Q: Why do we use `async` and `await` in ASP.NET Core controller actions and database calls?**
* **Context**: Explain how asynchronous programming frees up the application thread to handle other incoming HTTP requests while waiting for I/O operations (like database queries with EF Core's `ToListAsync()` or `FirstOrDefaultAsync()`) to complete, improving API scalability.

**Q: What is AsNoTracking in Entity Framework Core, and when should you use it?**
* **Context**: Discuss how `AsNoTracking()` improves read-only query performance by telling EF Core not to track the entities in the Change Tracker (useful for GET endpoints where data isn't being updated).

**Q: How would you implement pagination for a large dataset, like a list of all Employees or Attendance records?**
* **Context**: Explain how to use `Skip()` and `Take()` in EF Core LINQ queries to return smaller chunks of data to the frontend rather than loading the entire table into memory.

---

## 7. Application Architecture

**Q: Did you use the Repository Pattern in this project? Why or why not?**
* **Context**: Discuss whether `AppDbContext` is used directly in the controllers or abstracted behind a repository/service layer. Explain that `DbContext` itself implements the Repository and Unit of Work patterns, making an extra abstraction layer optional for simpler APIs.

**Q: Why use a relational database (SQLite) instead of a NoSQL database (like MongoDB) for this HRMS?**
* **Context**: Explain that HR systems inherently have highly relational data (Employees belong to Departments, have Salaries, Attendance, etc.), making a relational database with strict schemas and foreign key constraints the best fit.

---

## 8. C# Language Basics (1-20)
1. **What is C#?**
2. **What is the .NET Framework / .NET Core?**
3. **What is the difference between value types and reference types?**
4. **What is the difference between `String` and `StringBuilder`?**
5. **What are the access modifiers in C#?** (public, private, protected, internal, protected internal)
6. **Explain the `ref` and `out` keywords.**
7. **What is the `var` keyword in C#? Does it affect runtime performance?**
8. **What is the difference between `const` and `readonly`?**
9. **What is a nullable type in C#?**
10. **What is the difference between `==` and `.Equals()`?**
11. **What is boxing and unboxing?**
12. **What are extension methods?**
13. **What is the `using` statement used for?**
14. **What are partial classes?**
15. **What is the difference between `continue` and `break` statements?**
16. **What is the purpose of the `yield` keyword?**
17. **What are properties in C#? How do they differ from fields?**
18. **What is an enum?**
19. **What is a struct in C#? How does it differ from a class?**
20. **Explain the concept of assemblies in .NET.**

## 9. Object-Oriented Programming (OOP) in C# (21-40)
21. **What are the four pillars of OOP?**
22. **What is encapsulation? Provide an example.**
23. **What is abstraction? How is it implemented in C#?**
24. **What is inheritance? Does C# support multiple inheritance?**
25. **What is polymorphism? What are its types?** (Compile-time vs Runtime)
26. **What is the difference between an abstract class and an interface?**
27. **When should you use an interface over an abstract class?**
28. **What is method overloading?**
29. **What is method overriding?**
30. **What is the `virtual` keyword?**
31. **What is the `sealed` keyword?**
32. **What is the `base` keyword used for?**
33. **What is a constructor? Can it be private?**
34. **What is a static constructor?**
35. **What is the difference between early binding and late binding?**
36. **What is a destructor/finalizer?**
37. **Explain the `IDisposable` interface.**
38. **What is object initialization syntax?**
39. **What is dependency injection (in the context of class design)?**
40. **What is composition over inheritance?**

## 10. Advanced C# Concepts (41-60)
41. **What are Generics in C#? Why are they useful?**
42. **What is a Delegate?**
43. **What is a Multicast Delegate?**
44. **What are Events in C#?**
45. **What is the difference between a Delegate and an Event?**
46. **What are Anonymous methods?**
47. **What are Lambda expressions?**
48. **What is LINQ (Language Integrated Query)?**
49. **What is the difference between `IEnumerable` and `IQueryable`?**
50. **What is the difference between `First()` and `FirstOrDefault()` in LINQ?**
51. **What does the `Select` clause do in LINQ?**
52. **What does the `Where` clause do in LINQ?**
53. **Explain the difference between synchronous and asynchronous programming.**
54. **What are `async` and `await` keywords?**
55. **What is a `Task` in C#?**
56. **What is the difference between `Task` and `Thread`?**
57. **What are dynamic types in C#?**
58. **What is reflection in C#?**
59. **What are attributes in C#?**
60. **What is garbage collection in .NET? How does it work?**

## 11. ASP.NET Core Basics (61-80)
61. **What is ASP.NET Core?**
62. **How does ASP.NET Core differ from the older ASP.NET MVC 5 framework?**
63. **What is middleware in ASP.NET Core?**
64. **Explain the request processing pipeline.**
65. **What is Dependency Injection in ASP.NET Core?**
66. **What are the different service lifetimes in ASP.NET Core DI?** (Transient, Scoped, Singleton)
67. **What is routing in ASP.NET Core?**
68. **What is Attribute Routing?**
69. **What are Controllers in ASP.NET Core Web API?**
70. **What are Action Results (`IActionResult`, `ActionResult<T>`)?**
71. **What is Model Binding?**
72. **What is Model Validation? How do you use Data Annotations for it?**
73. **What is Kestrel?**
74. **How does configuration work in ASP.NET Core (`appsettings.json`)?**
75. **What are Environments in ASP.NET Core (Development, Staging, Production)?**
76. **What is a `Startup` class? (Or `Program.cs` in .NET 6+)**
77. **How do you return a 404 Not Found response from an API?**
78. **What are action filters?**
79. **How do you implement Cross-Origin Resource Sharing (CORS)?**
80. **What is Swagger/OpenAPI, and why is it used?**

## 12. Entity Framework Core & Database Basics (81-100)
81. **What is Entity Framework Core?**
82. **What is an ORM (Object-Relational Mapper)?**
83. **What is the `DbContext` class?**
84. **What is a `DbSet`?**
85. **Explain the Code-First approach.**
86. **Explain the Database-First approach.**
87. **What are EF Core Migrations?**
88. **What command adds a new migration?**
89. **What command applies migrations to the database?**
90. **How do you configure a primary key in EF Core?**
91. **How do you configure relationships (1-to-1, 1-to-many, many-to-many) in EF Core?**
92. **What is Eager Loading? How is it implemented?**
93. **What is Lazy Loading?**
94. **What is Explicit Loading?**
95. **What is the Change Tracker in EF Core?**
96. **What is `AsNoTracking()`?**
97. **How does EF Core handle concurrency?**
98. **What are Global Query Filters?**
99. **What is a Connection String?**
100. **How do you seed data in EF Core?**
