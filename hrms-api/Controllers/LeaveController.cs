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
public class LeaveController : ControllerBase
{
    private readonly AppDbContext _db;
    public LeaveController(AppDbContext db) => _db = db;

    [HttpGet("types")]
    public async Task<IActionResult> GetLeaveTypes()
    {
        var types = await _db.LeaveTypes.Where(t => !t.IsDeleted).Select(t => new LeaveTypeDto { Id = t.Id, Name = t.Name, MaxDaysPerYear = t.MaxDaysPerYear }).ToListAsync();
        return Ok(types);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? employeeId, [FromQuery] string? status)
    {
        var q = _db.Leaves.Include(l => l.Employee).Include(l => l.LeaveType).AsQueryable();
        if (employeeId.HasValue) q = q.Where(l => l.EmployeeId == employeeId);
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<LeaveStatus>(status, out var ls)) q = q.Where(l => l.Status == ls);

        var result = await q.OrderByDescending(l => l.CreatedAt).Select(l => new LeaveDto
        {
            Id = l.Id, EmployeeId = l.EmployeeId,
            EmployeeName = l.Employee.FirstName + " " + l.Employee.LastName,
            LeaveTypeName = l.LeaveType.Name, LeaveTypeId = l.LeaveTypeId,
            StartDate = l.StartDate, EndDate = l.EndDate, TotalDays = l.TotalDays,
            Reason = l.Reason, Status = l.Status.ToString(),
            ReviewedBy = l.ReviewedBy, ReviewedAt = l.ReviewedAt, ReviewRemarks = l.ReviewRemarks,
            AppliedAt = l.CreatedAt
        }).ToListAsync();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Apply(ApplyLeaveDto dto)
    {
        var totalDays = (int)(dto.EndDate - dto.StartDate).TotalDays + 1;
        if (totalDays <= 0) return BadRequest("End date must be after start date");

        var balance = await GetBalance(dto.EmployeeId, dto.LeaveTypeId, dto.StartDate.Year);
        if (balance < totalDays) return BadRequest($"Insufficient leave balance. Available: {balance} days");

        _db.Leaves.Add(new Leave
        {
            EmployeeId = dto.EmployeeId, LeaveTypeId = dto.LeaveTypeId,
            StartDate = dto.StartDate, EndDate = dto.EndDate,
            TotalDays = totalDays, Reason = dto.Reason,
            Status = LeaveStatus.Pending, CreatedBy = User.Identity?.Name
        });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Leave application submitted" });
    }

    [HttpPut("{id}/review")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Review(int id, ReviewLeaveDto dto)
    {
        var leave = await _db.Leaves.FindAsync(id);
        if (leave == null) return NotFound();
        leave.Status = dto.Action.Equals("Approve", StringComparison.OrdinalIgnoreCase) ? LeaveStatus.Approved : LeaveStatus.Rejected;
        leave.ReviewedBy = User.Identity?.Name;
        leave.ReviewedAt = DateTime.UtcNow;
        leave.ReviewRemarks = dto.Remarks;
        leave.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Leave {leave.Status}" });
    }

    [HttpGet("balance/{employeeId}")]
    public async Task<IActionResult> GetLeaveBalance(int employeeId, [FromQuery] int? year)
    {
        var yr = year ?? DateTime.UtcNow.Year;
        var leaveTypes = await _db.LeaveTypes.Where(t => !t.IsDeleted).ToListAsync();
        var result = new List<LeaveBalanceDto>();
        foreach (var lt in leaveTypes)
        {
            var used = await _db.Leaves.Where(l => l.EmployeeId == employeeId && l.LeaveTypeId == lt.Id && l.Status == LeaveStatus.Approved && l.StartDate.Year == yr).SumAsync(l => (int?)l.TotalDays) ?? 0;
            result.Add(new LeaveBalanceDto { LeaveTypeName = lt.Name, MaxDays = lt.MaxDaysPerYear, UsedDays = used, RemainingDays = lt.MaxDaysPerYear - used });
        }
        return Ok(result);
    }

    private async Task<int> GetBalance(int employeeId, int leaveTypeId, int year)
    {
        var lt = await _db.LeaveTypes.FindAsync(leaveTypeId);
        if (lt == null) return 0;
        var used = await _db.Leaves.Where(l => l.EmployeeId == employeeId && l.LeaveTypeId == leaveTypeId && l.Status == LeaveStatus.Approved && l.StartDate.Year == year).SumAsync(l => (int?)l.TotalDays) ?? 0;
        return lt.MaxDaysPerYear - used;
    }
}
