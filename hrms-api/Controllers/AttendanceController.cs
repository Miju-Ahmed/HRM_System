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
public class AttendanceController : ControllerBase
{
    private readonly AppDbContext _db;
    public AttendanceController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? employeeId, [FromQuery] int? month, [FromQuery] int? year)
    {
        var q = _db.Attendances.Include(a => a.Employee).AsQueryable();
        if (employeeId.HasValue) q = q.Where(a => a.EmployeeId == employeeId);
        if (month.HasValue) q = q.Where(a => a.Date.Month == month);
        if (year.HasValue) q = q.Where(a => a.Date.Year == year);
        var result = await q.OrderByDescending(a => a.Date)
            .Select(a => new AttendanceDto
            {
                Id = a.Id, EmployeeId = a.EmployeeId,
                EmployeeName = a.Employee.FirstName + " " + a.Employee.LastName,
                Date = a.Date, CheckIn = a.CheckIn, CheckOut = a.CheckOut,
                Status = a.Status.ToString(), WorkingHours = a.WorkingHours,
                OvertimeHours = a.OvertimeHours, Remarks = a.Remarks
            }).ToListAsync();
        return Ok(result);
    }

    [HttpPost("check-in")]
    public async Task<IActionResult> CheckIn(CheckInDto dto)
    {
        var today = DateTime.UtcNow.Date;
        var existing = await _db.Attendances.FirstOrDefaultAsync(a => a.EmployeeId == dto.EmployeeId && a.Date == today);
        if (existing != null) return BadRequest(new { message = "Already checked in today" });

        var now = DateTime.UtcNow;
        var lateThreshold = today.AddHours(9);
        var status = now > lateThreshold ? AttendanceStatus.Late : AttendanceStatus.Present;
        _db.Attendances.Add(new Attendance
        {
            EmployeeId = dto.EmployeeId, Date = today, CheckIn = now,
            Status = status, Remarks = dto.Remarks, CreatedBy = User.Identity?.Name
        });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Checked in successfully", status = status.ToString() });
    }

    [HttpPost("check-out")]
    public async Task<IActionResult> CheckOut(CheckOutDto dto)
    {
        var today = DateTime.UtcNow.Date;
        var attendance = await _db.Attendances.FirstOrDefaultAsync(a => a.EmployeeId == dto.EmployeeId && a.Date == today);
        if (attendance == null) return BadRequest(new { message = "No check-in record for today" });
        if (attendance.CheckOut != null) return BadRequest(new { message = "Already checked out" });

        var now = DateTime.UtcNow;
        attendance.CheckOut = now;
        var working = (decimal)(now - attendance.CheckIn!.Value).TotalHours;
        attendance.WorkingHours = Math.Round(Math.Max(working, 0), 2);
        attendance.OvertimeHours = attendance.WorkingHours > 8 ? Math.Round(attendance.WorkingHours - 8, 2) : 0;
        attendance.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Checked out successfully", workingHours = attendance.WorkingHours });
    }

    [HttpGet("today")]
    public async Task<IActionResult> Today()
    {
        var today = DateTime.UtcNow.Date;
        var result = await _db.Attendances.Include(a => a.Employee)
            .Where(a => a.Date == today)
            .Select(a => new AttendanceDto
            {
                Id = a.Id, EmployeeId = a.EmployeeId,
                EmployeeName = a.Employee.FirstName + " " + a.Employee.LastName,
                Date = a.Date, CheckIn = a.CheckIn, CheckOut = a.CheckOut,
                Status = a.Status.ToString(), WorkingHours = a.WorkingHours
            }).ToListAsync();
        return Ok(result);
    }

    [HttpGet("summary/{employeeId}")]
    public async Task<IActionResult> MonthlySummary(int employeeId, [FromQuery] int month, [FromQuery] int year)
    {
        var records = await _db.Attendances.Where(a => a.EmployeeId == employeeId && a.Date.Month == month && a.Date.Year == year).ToListAsync();
        return Ok(new
        {
            TotalDays = DateTime.DaysInMonth(year, month),
            PresentDays = records.Count(a => a.Status == AttendanceStatus.Present),
            LateDays = records.Count(a => a.Status == AttendanceStatus.Late),
            AbsentDays = records.Count(a => a.Status == AttendanceStatus.Absent),
            HalfDays = records.Count(a => a.Status == AttendanceStatus.HalfDay),
            TotalWorkingHours = records.Sum(a => a.WorkingHours),
            TotalOvertimeHours = records.Sum(a => a.OvertimeHours),
            Records = records.Select(a => new AttendanceDto
            {
                Id = a.Id, EmployeeId = a.EmployeeId, Date = a.Date,
                CheckIn = a.CheckIn, CheckOut = a.CheckOut,
                Status = a.Status.ToString(), WorkingHours = a.WorkingHours,
                OvertimeHours = a.OvertimeHours, Remarks = a.Remarks
            })
        });
    }
}
