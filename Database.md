# Database Architecture & Communication Process

This document outlines the database architecture, communication process, and underlying design principles used in this Human Resource Management System (HRMS).

## 1. Database Technology Stack

* **Database Engine**: [SQLite](https://www.sqlite.org/) is used as the primary relational database for data persistence. It is lightweight, file-based, and ideal for straightforward local deployment and development.
* **Object-Relational Mapper (ORM)**: **Entity Framework Core (EF Core)** is used as the ORM to bridge the gap between the C# object-oriented models and the relational database tables.
* **Identity Management**: **ASP.NET Core Identity** (`Microsoft.AspNetCore.Identity.EntityFrameworkCore`) is integrated directly into the database to manage users (`AppUser`), roles, passwords, and authentication tokens.

## 2. Architecture Approach: Code-First

The system employs a **Code-First** architecture. This means:
1. **Domain Models First**: The database schema is not manually created. Instead, C# classes (Entities) are defined first in the `hrms-api/Models` directory.
2. **DbContext**: The `AppDbContext` class inherits from `IdentityDbContext<AppUser>` and acts as the central hub communicating with the database. It maps the C# entity classes to database tables using `DbSet<T>`.
3. **Migrations**: EF Core Migrations are used to track changes in the models and automatically generate SQL scripts to update the SQLite database schema (`.db` file).

## 3. Key Design Patterns & Features

### A. Soft Delete & Global Query Filters
Instead of permanently deleting records from the database, the system uses a **Soft Delete** pattern. 
* Entities inherit from an `AuditEntity` base class, which includes an `IsDeleted` boolean flag.
* EF Core's **Global Query Filters** are configured in `AppDbContext.OnModelCreating()`. For example, `builder.Entity<Employee>().HasQueryFilter(e => !e.IsDeleted);` ensures that any standard query automatically excludes soft-deleted records.

### B. Audit Trails
The `AuditEntity` base class provides built-in tracking for common entity changes:
* `CreatedAt`, `UpdatedAt`
* `CreatedBy`, `ModifiedBy`
This ensures accountability for when records were added or modified.

### C. Precision Configuration
Financial consistency is enforced at the database level. EF Core is configured to automatically apply `decimal(18,2)` precision and scale to all decimal properties across all models (e.g., Salary, Bonuses, Deductions).

## 4. Core Entities and Relationships

The database is structured around several modular domains:

* **Identity & Authentication**
  * `AppUser`: Extends standard IdentityUser. Represents the login account.
  * **Relationship**: `AppUser` has a 1-to-1 relationship with `Employee` (An employee profile linked to a system user).

* **Organizational Structure**
  * `Department`: Supports a self-referencing hierarchy (Parent/Sub-departments).
  * `Designation`: Defines job roles/titles within the company.

* **Employee Management**
  * `Employee`: The core profile containing personal and job-related details.
  
* **Payroll & Financials**
  * `Salary`: Represents the base compensation. Has a 1-to-1 relationship with `Employee`. Contains ignored computed columns (`GrossSalary`, `NetSalary`) which are evaluated at runtime rather than stored.
  * `SalaryRevision`, `Bonus`, `Deduction`: Track changes and dynamic elements of employee compensation.
  * `Payroll`: Represents a generated salary slip for a specific month/year.

* **Time & Attendance**
  * `Attendance`: Tracks daily clock-in/clock-out events.
  * `LeaveType` & `Leave`: Manages leave policies and employee leave requests.

* **System Utilities**
  * `Notification`: Manages system alerts for users.

## 5. Database Initialization

Upon application startup, the system automatically runs the following communication process:
1. **Migration Execution**: Checks for any pending EF Core migrations and applies them to the SQLite database (`db.Database.MigrateAsync()`).
2. **Seeding**: The `DbSeeder.cs` utility is executed. It ensures that essential default data exists:
   * **Roles**: Creates default roles (Admin, HR, Employee).
   * **Admin User**: Creates a default system administrator account if none exists.
   * **Sample Data**: Seeds initial departments and designations to make the system usable immediately.
