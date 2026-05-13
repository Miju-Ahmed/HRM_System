using hrms_api.Data;
using hrms_api.DTOs;
using hrms_api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace hrms_api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _db;
    public EmployeesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int? departmentId,
        [FromQuery] string? status,
        [FromQuery] string? gender,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var q = _db.Employees
            .Include(e => e.Department)
            .Include(e => e.Designation)
            .Include(e => e.Salary)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(e => e.FirstName.Contains(search) || e.LastName.Contains(search) || e.Email.Contains(search) || e.EmployeeCode.Contains(search));
        if (departmentId.HasValue) q = q.Where(e => e.DepartmentId == departmentId);
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<EmploymentStatus>(status, out var s)) q = q.Where(e => e.Status == s);
        if (!string.IsNullOrWhiteSpace(gender) && Enum.TryParse<Gender>(gender, out var g)) q = q.Where(e => e.Gender == g);

        var total = await q.CountAsync();
        var items = await q.OrderBy(e => e.EmployeeCode)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(e => new EmployeeListDto
            {
                Id = e.Id, EmployeeCode = e.EmployeeCode,
                FullName = e.FirstName + " " + e.LastName,
                Email = e.Email, PhoneNumber = e.PhoneNumber,
                DepartmentName = e.Department.Name,
                DesignationTitle = e.Designation.Title,
                Status = e.Status.ToString(), Gender = e.Gender.ToString(),
                JoiningDate = e.JoiningDate,
                ProfileImagePath = e.ProfileImagePath,
                BasicSalary = e.Salary != null ? e.Salary.BasicSalary : null
            }).ToListAsync();

        return Ok(new PagedResult<EmployeeListDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var e = await _db.Employees.Include(x => x.Department).Include(x => x.Designation).FirstOrDefaultAsync(x => x.Id == id);
        if (e == null) return NotFound();
        return Ok(new EmployeeDetailDto
        {
            Id = e.Id, EmployeeCode = e.EmployeeCode, FullName = e.FirstName + " " + e.LastName,
            Email = e.Email, PhoneNumber = e.PhoneNumber, Address = e.Address,
            Gender = e.Gender.ToString(), DateOfBirth = e.DateOfBirth,
            JoiningDate = e.JoiningDate, DepartmentId = e.DepartmentId,
            DepartmentName = e.Department.Name, DesignationId = e.DesignationId,
            DesignationTitle = e.Designation.Title, Status = e.Status.ToString(),
            BankAccountNumber = e.BankAccountNumber, EmergencyContact = e.EmergencyContact,
            NationalId = e.NationalId, ProfileImagePath = e.ProfileImagePath
        });
    }

    [HttpPost]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Create(CreateEmployeeDto dto)
    {
        var code = "EMP" + (await _db.Employees.IgnoreQueryFilters().CountAsync() + 1).ToString("D3");
        if (!Enum.TryParse<Gender>(dto.Gender, out var gender)) return BadRequest("Invalid gender");
        if (!Enum.TryParse<EmploymentStatus>(dto.Status, out var empStatus)) return BadRequest("Invalid status");

        var emp = new Employee
        {
            EmployeeCode = code, FirstName = dto.FirstName, LastName = dto.LastName,
            Email = dto.Email, PhoneNumber = dto.PhoneNumber, Address = dto.Address,
            Gender = gender, DateOfBirth = dto.DateOfBirth, JoiningDate = dto.JoiningDate,
            DepartmentId = dto.DepartmentId, DesignationId = dto.DesignationId,
            BankAccountNumber = dto.BankAccountNumber, EmergencyContact = dto.EmergencyContact,
            NationalId = dto.NationalId, Status = empStatus,
            CreatedBy = User.Identity?.Name
        };
        _db.Employees.Add(emp);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = emp.Id }, new { emp.Id, emp.EmployeeCode });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Update(int id, UpdateEmployeeDto dto)
    {
        var emp = await _db.Employees.FindAsync(id);
        if (emp == null) return NotFound();
        if (!Enum.TryParse<Gender>(dto.Gender, out var gender)) return BadRequest("Invalid gender");
        if (!Enum.TryParse<EmploymentStatus>(dto.Status, out var empStatus)) return BadRequest("Invalid status");

        emp.FirstName = dto.FirstName; emp.LastName = dto.LastName;
        emp.Email = dto.Email; emp.PhoneNumber = dto.PhoneNumber;
        emp.Address = dto.Address; emp.Gender = gender;
        emp.DateOfBirth = dto.DateOfBirth; emp.JoiningDate = dto.JoiningDate;
        emp.DepartmentId = dto.DepartmentId; emp.DesignationId = dto.DesignationId;
        emp.BankAccountNumber = dto.BankAccountNumber;
        emp.EmergencyContact = dto.EmergencyContact;
        emp.NationalId = dto.NationalId; emp.Status = empStatus;
        emp.UpdatedAt = DateTime.UtcNow; emp.ModifiedBy = User.Identity?.Name;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var emp = await _db.Employees.FindAsync(id);
        if (emp == null) return NotFound();
        emp.IsDeleted = true; emp.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("stats")]
    public async Task<IActionResult> Stats()
    {
        var total = await _db.Employees.CountAsync();
        var active = await _db.Employees.CountAsync(e => e.Status == EmploymentStatus.Active);
        var byDept = await _db.Employees.Include(e => e.Department)
            .GroupBy(e => e.Department.Name)
            .Select(g => new { Department = g.Key, Count = g.Count() }).ToListAsync();
        return Ok(new { total, active, byDept });
    }

    [HttpPost("{id}/upload-photo")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> UploadPhoto(int id, IFormFile file)
    {
        var emp = await _db.Employees.FindAsync(id);
        if (emp == null) return NotFound();
        if (file == null || file.Length == 0) return BadRequest("No file uploaded");

        var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        Directory.CreateDirectory(uploadDir);
        var fileName = $"emp_{id}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadDir, fileName);
        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        emp.ProfileImagePath = $"/uploads/{fileName}";
        emp.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { path = emp.ProfileImagePath });
    }
}
