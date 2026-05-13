using System.Security.Claims;
using hrms_api.Data;
using hrms_api.DTOs;
using hrms_api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace hrms_api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(AppDbContext db, ILogger<DashboardController> logger)
    {
        _db = db;
        _logger = logger;
    }

    // ── ADMIN ENDPOINTS ────────────────────────────────────────────────────────
    [HttpGet("admin/summary")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AdminSummary()
    {
        try
        {
            var now = DateTime.UtcNow;
            var today = now.Date;
            var totalEmp = await _db.Employees.CountAsync();
            var activeEmp = await _db.Employees.CountAsync(e => e.Status == EmploymentStatus.Active);
            
            return Ok(new AdminSummaryDto
            {
                TotalEmployees = totalEmp,
                ActiveEmployees = activeEmp,
                InactiveEmployees = totalEmp - activeEmp,
                TotalDepartments = await _db.Departments.CountAsync(),
                TotalPayrollThisMonth = (decimal)await _db.Payrolls.Where(p => p.Month == now.Month && p.Year == now.Year).SumAsync(p => (double)p.NetSalary),
                TotalPendingLeaves = await _db.Leaves.CountAsync(l => l.Status == LeaveStatus.Pending),
                TotalAttendanceToday = await _db.Attendances.CountAsync(a => a.Date == today && (a.Status == AttendanceStatus.Present || a.Status == AttendanceStatus.Late)),
                TotalHrUsers = await _db.Users.CountAsync(u => u.Role == "HR"),
                TotalSalaryExpense = (decimal)await _db.Salaries.SumAsync(s => (double)s.BasicSalary),
                NewEmployeesThisMonth = await _db.Employees.CountAsync(e => e.JoiningDate.Month == now.Month && e.JoiningDate.Year == now.Year)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Admin Summary");
            return StatusCode(500, new { message = "Failed to load admin summary", error = ex.Message });
        }
    }

    [HttpGet("admin/charts")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AdminCharts()
    {
        try
        {
            var now = DateTime.UtcNow;
            var deptRaw = await _db.Employees.Include(e => e.Department).GroupBy(e => e.Department.Name).Select(g => new { Dept = g.Key, Count = g.Count() }).ToListAsync();
            var desigRaw = await _db.Employees.Include(e => e.Designation).GroupBy(e => e.Designation.Title).Select(g => new { Desig = g.Key, Count = g.Count() }).ToListAsync();
            var genderRaw = await _db.Employees.GroupBy(e => e.Gender).Select(g => new { Gender = g.Key.ToString(), Count = g.Count() }).ToListAsync();
            
            var trendRaw = await _db.Payrolls.Where(p => p.Year == now.Year).GroupBy(p => p.Month).Select(g => new { Month = g.Key, Total = g.Sum(p => (double)p.NetSalary) }).ToListAsync();
            var trend = trendRaw.Select(t => new { Month = t.Month.ToString(), Total = (decimal)t.Total }).OrderBy(m => int.Parse(m.Month)).Cast<dynamic>().ToList();

            return Ok(new AdminChartsDto
            {
                EmployeesByDepartment = deptRaw.Cast<dynamic>().ToList(),
                EmployeesByDesignation = desigRaw.Cast<dynamic>().ToList(),
                GenderDistribution = genderRaw.Cast<dynamic>().ToList(),
                PayrollTrend = trend
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Admin Charts");
            return StatusCode(500, new { message = "Failed to load admin charts", error = ex.Message });
        }
    }

    [HttpGet("admin/activities")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AdminActivities()
    {
        try
        {
            var recentEmps = await _db.Employees.OrderByDescending(e => e.Id).Take(3).Select(e => new ActivityDto { Description = $"New employee added: {e.FirstName} {e.LastName}", Timestamp = e.JoiningDate, Type = "Employee" }).ToListAsync();
            var recentLeaves = await _db.Leaves.Include(l => l.Employee).OrderByDescending(l => l.CreatedAt).Take(3).Select(l => new ActivityDto { Description = $"Leave applied by {l.Employee.FirstName}", Timestamp = l.CreatedAt, Type = "Leave" }).ToListAsync();
            var recentBonus = await _db.Bonuses.OrderByDescending(b => b.BonusDate).Take(2).Select(b => new ActivityDto { Description = $"Bonus '{b.BonusType}' awarded", Timestamp = b.BonusDate, Type = "Salary" }).ToListAsync();
            
            var activities = recentEmps.Concat(recentLeaves).Concat(recentBonus).OrderByDescending(a => a.Timestamp).Take(8).ToList();
            return Ok(activities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Admin Activities");
            return StatusCode(500, new { message = "Failed to load admin activities", error = ex.Message });
        }
    }

    [HttpGet("admin/notifications")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AdminNotifications()
    {
        try
        {
            var pending = await _db.Leaves.CountAsync(l => l.Status == LeaveStatus.Pending);
            var notifs = new List<dynamic>();
            if (pending > 0) notifs.Add(new { Title = "Pending Leaves", Message = $"{pending} leaves awaiting approval", Type = "Warning" });
            notifs.Add(new { Title = "System Status", Message = "All systems operational", Type = "Info" });
            return Ok(notifs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Admin Notifications");
            return StatusCode(500, new { message = "Failed to load admin notifications", error = ex.Message });
        }
    }

    // ── HR ENDPOINTS ──────────────────────────────────────────────────────────
    [HttpGet("hr/summary")]
    [Authorize(Roles = "HR")]
    public async Task<IActionResult> HrSummary()
    {
        try
        {
            var today = DateTime.UtcNow.Date;
            var now = DateTime.UtcNow;
            var totalEmp = await _db.Employees.CountAsync();
            var activeEmp = await _db.Employees.CountAsync(e => e.Status == EmploymentStatus.Active);
            
            return Ok(new HrSummaryDto
            {
                TotalEmployees = totalEmp,
                ActiveEmployees = activeEmp,
                TodayAttendance = await _db.Attendances.CountAsync(a => a.Date == today && (a.Status == AttendanceStatus.Present || a.Status == AttendanceStatus.Late)),
                PendingLeaves = await _db.Leaves.CountAsync(l => l.Status == LeaveStatus.Pending),
                NewJoiners = await _db.Employees.CountAsync(e => e.JoiningDate.Month == now.Month && e.JoiningDate.Year == now.Year),
                EmployeesOnLeaveToday = await _db.Leaves.CountAsync(l => l.Status == LeaveStatus.Approved && l.StartDate <= today && l.EndDate >= today)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching HR Summary");
            return StatusCode(500, new { message = "Failed to load hr summary", error = ex.Message });
        }
    }

    [HttpGet("hr/charts")]
    [Authorize(Roles = "HR")]
    public async Task<IActionResult> HrCharts()
    {
        try
        {
            var today = DateTime.UtcNow.Date;
            var activeEmp = await _db.Employees.CountAsync(e => e.Status == EmploymentStatus.Active);
            var present = await _db.Attendances.CountAsync(a => a.Date == today && a.Status == AttendanceStatus.Present);
            var late = await _db.Attendances.CountAsync(a => a.Date == today && a.Status == AttendanceStatus.Late);
            var onLeave = await _db.Leaves.CountAsync(l => l.Status == LeaveStatus.Approved && l.StartDate <= today && l.EndDate >= today);
            var absent = activeEmp - present - late - onLeave;

            var attSum = new List<dynamic>
            {
                new { Status = "Present", Count = present },
                new { Status = "Late", Count = late },
                new { Status = "On Leave", Count = onLeave },
                new { Status = "Absent", Count = Math.Max(0, absent) }
            };

            var leaveRaw = await _db.Leaves.Include(l => l.LeaveType).GroupBy(l => l.LeaveType.Name).Select(g => new { Type = g.Key, Count = g.Count() }).ToListAsync();

            return Ok(new HrChartsDto { AttendanceSummary = attSum, LeaveTrends = leaveRaw.Cast<dynamic>().ToList() });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching HR Charts");
            return StatusCode(500, new { message = "Failed to load hr charts", error = ex.Message });
        }
    }

    [HttpGet("hr/tasks")]
    [Authorize(Roles = "HR")]
    public async Task<IActionResult> HrTasks()
    {
        try
        {
            var tasks = new List<HrTaskDto>();
            var pendingLeaves = await _db.Leaves.CountAsync(l => l.Status == LeaveStatus.Pending);
            if (pendingLeaves > 0) tasks.Add(new HrTaskDto { TaskName = $"{pendingLeaves} Pending Leave Requests", Priority = "High", ActionLink = "/leave" });
            tasks.Add(new HrTaskDto { TaskName = "Review Daily Attendance", Priority = "Medium", ActionLink = "/attendance" });
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching HR Tasks");
            return StatusCode(500, new { message = "Failed to load hr tasks", error = ex.Message });
        }
    }

    // ── EMPLOYEE ENDPOINTS ────────────────────────────────────────────────────
    private async Task<Employee?> GetCurrentEmployee()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _db.Users.FindAsync(userId);
        if (user?.EmployeeId == null) return null;
        return await _db.Employees.Include(e => e.Department).Include(e => e.Designation).FirstOrDefaultAsync(e => e.Id == user.EmployeeId);
    }

    [HttpGet("employee/summary")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> EmpSummary()
    {
        try
        {
            var emp = await GetCurrentEmployee();
            if (emp == null) return NotFound("Employee not found");
            var salary = await _db.Salaries.FirstOrDefaultAsync(s => s.EmployeeId == emp.Id);
            
            var empDto = new EmployeeDetailDto
            {
                Id = emp.Id, EmployeeCode = emp.EmployeeCode, FullName = emp.FirstName + " " + emp.LastName,
                Email = emp.Email, PhoneNumber = emp.PhoneNumber, DepartmentName = emp.Department.Name,
                DesignationTitle = emp.Designation.Title, Status = emp.Status.ToString(), ProfileImagePath = emp.ProfileImagePath
            };

            var usedLeaves = await _db.Leaves.Where(l => l.EmployeeId == emp.Id && l.Status == LeaveStatus.Approved && l.StartDate.Year == DateTime.UtcNow.Year).SumAsync(l => (int?)l.TotalDays) ?? 0;
            var totalLeaves = await _db.LeaveTypes.SumAsync(lt => (int?)lt.MaxDaysPerYear) ?? 0;

            var net = salary != null ? (salary.BasicSalary + salary.HouseRentAllowance + salary.MedicalAllowance + salary.TransportAllowance + salary.OtherAllowance) - salary.ProvidentFund - salary.TaxAmount : 0;

            return Ok(new EmpSummaryDto
            {
                Profile = empDto,
                CurrentSalary = net,
                LeaveBalance = Math.Max(0, totalLeaves - usedLeaves),
                PendingLeaves = await _db.Leaves.CountAsync(l => l.EmployeeId == emp.Id && l.Status == LeaveStatus.Pending)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Employee Summary");
            return StatusCode(500, new { message = "Failed to load employee summary", error = ex.Message });
        }
    }

    [HttpGet("employee/attendance")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> EmpAttendance()
    {
        try
        {
            var emp = await GetCurrentEmployee();
            if (emp == null) return NotFound("Employee not found");
            var now = DateTime.UtcNow;

            var monthAtt = await _db.Attendances.Where(a => a.EmployeeId == emp.Id && a.Date.Month == now.Month && a.Date.Year == now.Year).ToListAsync();
            var present = monthAtt.Count(a => a.Status == AttendanceStatus.Present);
            var late = monthAtt.Count(a => a.Status == AttendanceStatus.Late);

            var chart = monthAtt.OrderBy(a => a.Date).Select(a => new { Day = a.Date.Day.ToString(), Status = a.Status.ToString(), Hours = a.WorkingHours }).Cast<dynamic>().ToList();

            return Ok(new EmpAttendanceDto { PresentDays = present, LateDays = late, AbsentDays = Math.Max(0, now.Day - present - late), MonthlyChart = chart });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Employee Attendance");
            return StatusCode(500, new { message = "Failed to load employee attendance", error = ex.Message });
        }
    }

    [HttpGet("employee/salary")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> EmpSalary()
    {
        try
        {
            var emp = await GetCurrentEmployee();
            if (emp == null) return NotFound("Employee not found");
            
            var salary = await _db.Salaries.FirstOrDefaultAsync(s => s.EmployeeId == emp.Id);
            var recent = await _db.Payrolls.Where(p => p.EmployeeId == emp.Id).OrderByDescending(p => p.Year).ThenByDescending(p => p.Month).Take(6).ToListAsync();

            var net = salary != null ? (salary.BasicSalary + salary.HouseRentAllowance + salary.MedicalAllowance + salary.TransportAllowance + salary.OtherAllowance) - salary.ProvidentFund - salary.TaxAmount : 0;
            
            return Ok(new EmpSalaryDto
            {
                Basic = salary?.BasicSalary ?? 0,
                Deductions = salary != null ? salary.ProvidentFund + salary.TaxAmount : 0,
                Bonuses = 0,
                Net = net,
                RecentPayslips = recent.Select(p => new PayrollDto { Id = p.Id, Month = p.Month, Year = p.Year, NetSalary = p.NetSalary, Status = p.Status.ToString() }).ToList()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Employee Salary");
            return StatusCode(500, new { message = "Failed to load employee salary", error = ex.Message });
        }
    }

    [HttpGet("employee/leave")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> EmpLeave()
    {
        try
        {
            var emp = await GetCurrentEmployee();
            if (emp == null) return NotFound("Employee not found");

            var used = await _db.Leaves.Where(l => l.EmployeeId == emp.Id && l.Status == LeaveStatus.Approved && l.StartDate.Year == DateTime.UtcNow.Year).SumAsync(l => (int?)l.TotalDays) ?? 0;
            var total = await _db.LeaveTypes.SumAsync(lt => (int?)lt.MaxDaysPerYear) ?? 0;

            var history = await _db.Leaves.Include(l => l.LeaveType).Where(l => l.EmployeeId == emp.Id).OrderByDescending(l => l.CreatedAt).Take(10).ToListAsync();

            return Ok(new EmpLeaveDto
            {
                Used = used,
                Remaining = Math.Max(0, total - used),
                History = history.Select(l => new LeaveDto { LeaveTypeName = l.LeaveType.Name, StartDate = l.StartDate, EndDate = l.EndDate, TotalDays = l.TotalDays, Status = l.Status.ToString() }).ToList()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Employee Leave");
            return StatusCode(500, new { message = "Failed to load employee leave", error = ex.Message });
        }
    }
}
