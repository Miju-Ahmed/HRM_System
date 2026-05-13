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
public class SalaryController : ControllerBase
{
    private readonly AppDbContext _db;
    public SalaryController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var salaries = await _db.Salaries
            .Include(s => s.Employee).ThenInclude(e => e.Department)
            .OrderBy(s => s.Employee.EmployeeCode)
            .Select(s => new SalaryDto
            {
                Id = s.Id, EmployeeId = s.EmployeeId,
                EmployeeName = s.Employee.FirstName + " " + s.Employee.LastName,
                EmployeeCode = s.Employee.EmployeeCode,
                DepartmentName = s.Employee.Department.Name,
                BasicSalary = s.BasicSalary, HouseRentAllowance = s.HouseRentAllowance,
                MedicalAllowance = s.MedicalAllowance, TransportAllowance = s.TransportAllowance,
                OtherAllowance = s.OtherAllowance, ProvidentFund = s.ProvidentFund,
                TaxAmount = s.TaxAmount, EffectiveFrom = s.EffectiveFrom,
                GrossSalary = s.BasicSalary + s.HouseRentAllowance + s.MedicalAllowance + s.TransportAllowance + s.OtherAllowance,
                NetSalary = s.BasicSalary + s.HouseRentAllowance + s.MedicalAllowance + s.TransportAllowance + s.OtherAllowance - s.ProvidentFund - s.TaxAmount
            }).ToListAsync();
        return Ok(salaries);
    }

    [HttpGet("{employeeId}")]
    public async Task<IActionResult> GetByEmployee(int employeeId)
    {
        var s = await _db.Salaries.Include(x => x.Employee).ThenInclude(e => e.Department)
            .Include(x => x.Revisions).Include(x => x.Bonuses).Include(x => x.Deductions)
            .FirstOrDefaultAsync(x => x.EmployeeId == employeeId);
        if (s == null) return NotFound(new { message = "No salary record found for this employee" });

        var gross = s.BasicSalary + s.HouseRentAllowance + s.MedicalAllowance + s.TransportAllowance + s.OtherAllowance;
        return Ok(new
        {
            salary = new SalaryDto
            {
                Id = s.Id, EmployeeId = s.EmployeeId,
                EmployeeName = s.Employee.FirstName + " " + s.Employee.LastName,
                EmployeeCode = s.Employee.EmployeeCode,
                DepartmentName = s.Employee.Department.Name,
                BasicSalary = s.BasicSalary, HouseRentAllowance = s.HouseRentAllowance,
                MedicalAllowance = s.MedicalAllowance, TransportAllowance = s.TransportAllowance,
                OtherAllowance = s.OtherAllowance, ProvidentFund = s.ProvidentFund,
                TaxAmount = s.TaxAmount, GrossSalary = gross,
                NetSalary = gross - s.ProvidentFund - s.TaxAmount, EffectiveFrom = s.EffectiveFrom
            },
            revisions = s.Revisions.OrderByDescending(r => r.RevisionDate).Select(r => new SalaryRevisionDto
            {
                Id = r.Id, OldBasicSalary = r.OldBasicSalary, NewBasicSalary = r.NewBasicSalary,
                OldGrossSalary = r.OldGrossSalary, NewGrossSalary = r.NewGrossSalary,
                Reason = r.Reason, RevisionDate = r.RevisionDate, RevisedBy = r.RevisedBy
            }),
            bonuses = s.Bonuses.Where(b => !b.IsDeleted).OrderByDescending(b => b.BonusDate)
                .Select(b => new BonusDto { Id = b.Id, BonusType = b.BonusType, Amount = b.Amount, Remarks = b.Remarks, BonusDate = b.BonusDate }),
            deductions = s.Deductions.Where(d => !d.IsDeleted).OrderByDescending(d => d.DeductionDate)
                .Select(d => new DeductionDto { Id = d.Id, DeductionType = d.DeductionType, Amount = d.Amount, Remarks = d.Remarks, DeductionDate = d.DeductionDate })
        });
    }

    [HttpPost("{employeeId}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> SetSalary(int employeeId, SetSalaryDto dto)
    {
        if (dto.BasicSalary < 0) return BadRequest("Salary cannot be negative");
        var existing = await _db.Salaries.Include(s => s.Revisions).FirstOrDefaultAsync(s => s.EmployeeId == employeeId);
        var gross = dto.BasicSalary + dto.HouseRentAllowance + dto.MedicalAllowance + dto.TransportAllowance + dto.OtherAllowance;
        var tax = gross > 25000 ? (gross - 25000) * 0.10m : 0;

        if (existing == null)
        {
            var sal = new Salary
            {
                EmployeeId = employeeId, BasicSalary = dto.BasicSalary,
                HouseRentAllowance = dto.HouseRentAllowance, MedicalAllowance = dto.MedicalAllowance,
                TransportAllowance = dto.TransportAllowance, OtherAllowance = dto.OtherAllowance,
                ProvidentFund = dto.ProvidentFund, TaxAmount = tax, EffectiveFrom = dto.EffectiveFrom,
                CreatedBy = User.Identity?.Name
            };
            _db.Salaries.Add(sal);
        }
        else
        {
            var oldGross = existing.BasicSalary + existing.HouseRentAllowance + existing.MedicalAllowance + existing.TransportAllowance + existing.OtherAllowance;
            existing.Revisions.Add(new SalaryRevision
            {
                OldBasicSalary = existing.BasicSalary, NewBasicSalary = dto.BasicSalary,
                OldGrossSalary = oldGross, NewGrossSalary = gross,
                Reason = dto.RevisionReason ?? "Salary Update",
                RevisionDate = DateTime.UtcNow, RevisedBy = User.Identity?.Name ?? "System"
            });
            existing.BasicSalary = dto.BasicSalary; existing.HouseRentAllowance = dto.HouseRentAllowance;
            existing.MedicalAllowance = dto.MedicalAllowance; existing.TransportAllowance = dto.TransportAllowance;
            existing.OtherAllowance = dto.OtherAllowance; existing.ProvidentFund = dto.ProvidentFund;
            existing.TaxAmount = tax; existing.EffectiveFrom = dto.EffectiveFrom;
            existing.UpdatedAt = DateTime.UtcNow; existing.ModifiedBy = User.Identity?.Name;
        }
        await _db.SaveChangesAsync();
        return Ok(new { message = "Salary saved" });
    }

    [HttpPost("{employeeId}/bonus")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> AddBonus(int employeeId, CreateBonusDto dto)
    {
        if (dto.Amount <= 0) return BadRequest("Bonus must be positive");
        var sal = await _db.Salaries.FirstOrDefaultAsync(s => s.EmployeeId == employeeId);
        if (sal == null) return NotFound("No salary record");
        _db.Bonuses.Add(new Bonus { SalaryId = sal.Id, BonusType = dto.BonusType, Amount = dto.Amount, Remarks = dto.Remarks, BonusDate = dto.BonusDate, CreatedBy = User.Identity?.Name });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Bonus added" });
    }

    [HttpDelete("bonus/{id}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> DeleteBonus(int id)
    {
        var b = await _db.Bonuses.FindAsync(id);
        if (b == null) return NotFound();
        b.IsDeleted = true; await _db.SaveChangesAsync(); return NoContent();
    }

    [HttpPost("{employeeId}/deduction")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> AddDeduction(int employeeId, CreateDeductionDto dto)
    {
        if (dto.Amount <= 0) return BadRequest("Deduction must be positive");
        var sal = await _db.Salaries.FirstOrDefaultAsync(s => s.EmployeeId == employeeId);
        if (sal == null) return NotFound("No salary record");
        _db.Deductions.Add(new Deduction { SalaryId = sal.Id, DeductionType = dto.DeductionType, Amount = dto.Amount, Remarks = dto.Remarks, DeductionDate = dto.DeductionDate, CreatedBy = User.Identity?.Name });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Deduction added" });
    }

    [HttpDelete("deduction/{id}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> DeleteDeduction(int id)
    {
        var d = await _db.Deductions.FindAsync(id);
        if (d == null) return NotFound();
        d.IsDeleted = true; await _db.SaveChangesAsync(); return NoContent();
    }
}
