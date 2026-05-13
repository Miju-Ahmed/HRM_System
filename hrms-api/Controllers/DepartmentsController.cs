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
public class DepartmentsController : ControllerBase
{
    private readonly AppDbContext _db;
    public DepartmentsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var depts = await _db.Departments
            .Include(d => d.ParentDepartment).Include(d => d.Employees)
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentDto(d.Id, d.Name, d.Description, d.ParentDepartmentId,
                d.ParentDepartment != null ? d.ParentDepartment.Name : null,
                d.Employees.Count(e => !e.IsDeleted)))
            .ToListAsync();
        return Ok(depts);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var d = await _db.Departments.Include(x => x.ParentDepartment).Include(x => x.Employees).FirstOrDefaultAsync(x => x.Id == id);
        if (d == null) return NotFound();
        return Ok(new DepartmentDto(d.Id, d.Name, d.Description, d.ParentDepartmentId, d.ParentDepartment?.Name, d.Employees.Count(e => !e.IsDeleted)));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Create(CreateDepartmentDto dto)
    {
        var dept = new Department { Name = dto.Name, Description = dto.Description, ParentDepartmentId = dto.ParentDepartmentId, CreatedBy = User.Identity?.Name };
        _db.Departments.Add(dept);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = dept.Id }, dept);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Update(int id, UpdateDepartmentDto dto)
    {
        var dept = await _db.Departments.FindAsync(id);
        if (dept == null) return NotFound();
        dept.Name = dto.Name; dept.Description = dto.Description; dept.ParentDepartmentId = dto.ParentDepartmentId;
        dept.UpdatedAt = DateTime.UtcNow; dept.ModifiedBy = User.Identity?.Name;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var dept = await _db.Departments.FindAsync(id);
        if (dept == null) return NotFound();
        dept.IsDeleted = true; await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("designations")]
    public async Task<IActionResult> GetDesignations([FromQuery] int? departmentId)
    {
        var q = _db.Designations.Include(d => d.Department).Include(d => d.Employees).AsQueryable();
        if (departmentId.HasValue) q = q.Where(d => d.DepartmentId == departmentId.Value);
        var result = await q.OrderBy(d => d.Title)
            .Select(d => new DesignationDto(d.Id, d.Title, d.Description, d.DepartmentId, d.Department.Name, d.Employees.Count(e => !e.IsDeleted)))
            .ToListAsync();
        return Ok(result);
    }

    [HttpPost("designations")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> CreateDesignation(CreateDesignationDto dto)
    {
        var des = new Designation { Title = dto.Title, Description = dto.Description, DepartmentId = dto.DepartmentId, CreatedBy = User.Identity?.Name };
        _db.Designations.Add(des); await _db.SaveChangesAsync(); return Ok(des);
    }

    [HttpPut("designations/{id}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> UpdateDesignation(int id, UpdateDesignationDto dto)
    {
        var des = await _db.Designations.FindAsync(id);
        if (des == null) return NotFound();
        des.Title = dto.Title; des.Description = dto.Description; des.DepartmentId = dto.DepartmentId; des.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(); return NoContent();
    }

    [HttpDelete("designations/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteDesignation(int id)
    {
        var des = await _db.Designations.FindAsync(id);
        if (des == null) return NotFound();
        des.IsDeleted = true; await _db.SaveChangesAsync(); return NoContent();
    }
}
