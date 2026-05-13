using hrms_api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace hrms_api.Data;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Designation> Designations => Set<Designation>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Salary> Salaries => Set<Salary>();
    public DbSet<SalaryRevision> SalaryRevisions => Set<SalaryRevision>();
    public DbSet<Bonus> Bonuses => Set<Bonus>();
    public DbSet<Deduction> Deductions => Set<Deduction>();
    public DbSet<Payroll> Payrolls => Set<Payroll>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<LeaveType> LeaveTypes => Set<LeaveType>();
    public DbSet<Leave> Leaves => Set<Leave>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Salary — computed columns stored as ignored (calculated in code)
        builder.Entity<Salary>().Ignore(s => s.GrossSalary).Ignore(s => s.NetSalary);

        // Department self-referencing hierarchy
        builder.Entity<Department>()
            .HasOne(d => d.ParentDepartment)
            .WithMany(d => d.SubDepartments)
            .HasForeignKey(d => d.ParentDepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Employee → AppUser 1-to-1
        builder.Entity<AppUser>()
            .HasOne(u => u.Employee)
            .WithOne(e => e.User)
            .HasForeignKey<AppUser>(u => u.EmployeeId)
            .OnDelete(DeleteBehavior.SetNull);

        // Salary one-to-one with Employee
        builder.Entity<Salary>()
            .HasOne(s => s.Employee)
            .WithOne(e => e.Salary)
            .HasForeignKey<Salary>(s => s.EmployeeId);

        // Precision for decimals
        foreach (var prop in builder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            prop.SetPrecision(18);
            prop.SetScale(2);
        }

        // Global soft-delete query filters
        builder.Entity<Employee>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<Department>().HasQueryFilter(d => !d.IsDeleted);
        builder.Entity<Designation>().HasQueryFilter(d => !d.IsDeleted);
        builder.Entity<Salary>().HasQueryFilter(s => !s.IsDeleted);
        builder.Entity<Payroll>().HasQueryFilter(p => !p.IsDeleted);
        builder.Entity<Attendance>().HasQueryFilter(a => !a.IsDeleted);
        builder.Entity<Leave>().HasQueryFilter(l => !l.IsDeleted);
    }
}
