using hrms_api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace hrms_api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, RoleManager<IdentityRole> roleManager, UserManager<AppUser> userManager)
    {
        // Roles
        string[] roles = { "Admin", "HR", "Employee" };
        foreach (var role in roles)
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));

        // Departments
        if (!await db.Departments.AnyAsync())
        {
            var departments = new List<Department>
            {
                new() { Name = "Engineering", Description = "Software & IT" },
                new() { Name = "Human Resources", Description = "People & Culture" },
                new() { Name = "Finance", Description = "Accounts & Finance" },
                new() { Name = "Marketing", Description = "Brand & Growth" },
                new() { Name = "Operations", Description = "Day-to-day Operations" },
            };
            db.Departments.AddRange(departments);
            await db.SaveChangesAsync();

            // Designations
            var eng = departments[0]; var hr = departments[1]; var fin = departments[2];
            var mkt = departments[3]; var ops = departments[4];
            var designations = new List<Designation>
            {
                new() { Title = "Software Engineer", DepartmentId = eng.Id },
                new() { Title = "Senior Software Engineer", DepartmentId = eng.Id },
                new() { Title = "Tech Lead", DepartmentId = eng.Id },
                new() { Title = "HR Manager", DepartmentId = hr.Id },
                new() { Title = "HR Executive", DepartmentId = hr.Id },
                new() { Title = "Accountant", DepartmentId = fin.Id },
                new() { Title = "Finance Manager", DepartmentId = fin.Id },
                new() { Title = "Marketing Executive", DepartmentId = mkt.Id },
                new() { Title = "Operations Manager", DepartmentId = ops.Id },
            };
            db.Designations.AddRange(designations);
            await db.SaveChangesAsync();

            // Leave Types
            db.LeaveTypes.AddRange(
                new LeaveType { Name = "Sick Leave", MaxDaysPerYear = 14, Description = "For illness" },
                new LeaveType { Name = "Casual Leave", MaxDaysPerYear = 10, Description = "Personal reasons" },
                new LeaveType { Name = "Annual Leave", MaxDaysPerYear = 21, Description = "Paid annual vacation" }
            );
            await db.SaveChangesAsync();

            // Sample Employees
            var employees = new List<Employee>
            {
                new() { EmployeeCode = "EMP001", FirstName = "Rahim", LastName = "Uddin", Email = "rahim@hrms.com", PhoneNumber = "01711000001", Gender = Gender.Male, DateOfBirth = new DateTime(1990, 3, 15), JoiningDate = new DateTime(2021, 1, 10), DepartmentId = eng.Id, DesignationId = designations[0].Id, Status = EmploymentStatus.Active, NationalId = "1234567890", BankAccountNumber = "BD0011234567" },
                new() { EmployeeCode = "EMP002", FirstName = "Farida", LastName = "Begum", Email = "farida@hrms.com", PhoneNumber = "01711000002", Gender = Gender.Female, DateOfBirth = new DateTime(1992, 7, 22), JoiningDate = new DateTime(2021, 3, 5), DepartmentId = hr.Id, DesignationId = designations[3].Id, Status = EmploymentStatus.Active, NationalId = "2345678901", BankAccountNumber = "BD0022345678" },
                new() { EmployeeCode = "EMP003", FirstName = "Karim", LastName = "Hossain", Email = "karim@hrms.com", PhoneNumber = "01711000003", Gender = Gender.Male, DateOfBirth = new DateTime(1988, 11, 10), JoiningDate = new DateTime(2020, 6, 15), DepartmentId = fin.Id, DesignationId = designations[5].Id, Status = EmploymentStatus.Active, NationalId = "3456789012", BankAccountNumber = "BD0033456789" },
                new() { EmployeeCode = "EMP004", FirstName = "Sonia", LastName = "Akter", Email = "sonia@hrms.com", PhoneNumber = "01711000004", Gender = Gender.Female, DateOfBirth = new DateTime(1995, 4, 18), JoiningDate = new DateTime(2022, 8, 1), DepartmentId = mkt.Id, DesignationId = designations[7].Id, Status = EmploymentStatus.Active, NationalId = "4567890123", BankAccountNumber = "BD0044567890" },
                new() { EmployeeCode = "EMP005", FirstName = "Tanvir", LastName = "Ahmed", Email = "tanvir@hrms.com", PhoneNumber = "01711000005", Gender = Gender.Male, DateOfBirth = new DateTime(1987, 9, 5), JoiningDate = new DateTime(2019, 2, 20), DepartmentId = eng.Id, DesignationId = designations[2].Id, Status = EmploymentStatus.Active, NationalId = "5678901234", BankAccountNumber = "BD0055678901" },
            };
            db.Employees.AddRange(employees);
            await db.SaveChangesAsync();

            // Salaries for each employee
            var salaryData = new[] {
                (35000m, 12000m, 3000m, 2000m, 1000m),
                (45000m, 15000m, 4000m, 2500m, 1500m),
                (40000m, 13000m, 3500m, 2000m, 1000m),
                (30000m, 10000m, 2500m, 1500m, 500m),
                (60000m, 20000m, 5000m, 3000m, 2000m),
            };
            for (int i = 0; i < employees.Count; i++)
            {
                var (basic, house, medical, transport, other) = salaryData[i];
                var gross = basic + house + medical + transport + other;
                var tax = gross > 25000 ? (gross - 25000) * 0.10m : 0;
                var pf = basic * 0.05m;
                db.Salaries.Add(new Salary
                {
                    EmployeeId = employees[i].Id,
                    BasicSalary = basic, HouseRentAllowance = house,
                    MedicalAllowance = medical, TransportAllowance = transport,
                    OtherAllowance = other, TaxAmount = tax, ProvidentFund = pf,
                    EffectiveFrom = employees[i].JoiningDate
                });
            }
            await db.SaveChangesAsync();
        }

        // Admin user
        if (await userManager.FindByEmailAsync("admin@hrms.com") == null)
        {
            var admin = new AppUser { FullName = "System Admin", UserName = "admin@hrms.com", Email = "admin@hrms.com", EmailConfirmed = true, Role = "Admin" };
            var result = await userManager.CreateAsync(admin, "Admin@123");
            if (result.Succeeded) await userManager.AddToRoleAsync(admin, "Admin");
        }

        // HR user linked to HR employee
        if (await userManager.FindByEmailAsync("farida@hrms.com") == null)
        {
            var hrEmp = await db.Employees.FirstOrDefaultAsync(e => e.Email == "farida@hrms.com");
            var hrUser = new AppUser { FullName = "Farida Begum", UserName = "farida@hrms.com", Email = "farida@hrms.com", EmailConfirmed = true, Role = "HR", EmployeeId = hrEmp?.Id };
            var result = await userManager.CreateAsync(hrUser, "Hr@123456");
            if (result.Succeeded) await userManager.AddToRoleAsync(hrUser, "HR");
        }

        // Employee users
        var empUsers = new[] {
            ("rahim@hrms.com", "Rahim Uddin", "Emp@123456"),
            ("karim@hrms.com", "Karim Hossain", "Emp@123456"),
            ("sonia@hrms.com", "Sonia Akter", "Emp@123456"),
            ("tanvir@hrms.com", "Tanvir Ahmed", "Emp@123456"),
        };
        foreach (var (email, name, pwd) in empUsers)
        {
            if (await userManager.FindByEmailAsync(email) == null)
            {
                var emp = await db.Employees.FirstOrDefaultAsync(e => e.Email == email);
                var user = new AppUser { FullName = name, UserName = email, Email = email, EmailConfirmed = true, Role = "Employee", EmployeeId = emp?.Id };
                var result = await userManager.CreateAsync(user, pwd);
                if (result.Succeeded) await userManager.AddToRoleAsync(user, "Employee");
            }
        }

        await db.SaveChangesAsync();
    }
}
