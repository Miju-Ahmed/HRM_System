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
public class PayrollController : ControllerBase
{
    private readonly AppDbContext _db;
    public PayrollController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? month, [FromQuery] int? year, [FromQuery] int? employeeId, [FromQuery] int? departmentId)
    {
        var q = _db.Payrolls.Include(p => p.Employee).ThenInclude(e => e.Department).Include(p => p.Employee.Designation).AsQueryable();
        if (month.HasValue) q = q.Where(p => p.Month == month);
        if (year.HasValue) q = q.Where(p => p.Year == year);
        if (employeeId.HasValue) q = q.Where(p => p.EmployeeId == employeeId);
        if (departmentId.HasValue) q = q.Where(p => p.Employee.DepartmentId == departmentId);

        var result = await q.OrderByDescending(p => p.Year).ThenByDescending(p => p.Month)
            .Select(p => new PayrollDto
            {
                Id = p.Id, EmployeeId = p.EmployeeId,
                EmployeeName = p.Employee.FirstName + " " + p.Employee.LastName,
                EmployeeCode = p.Employee.EmployeeCode,
                DepartmentName = p.Employee.Department.Name,
                DesignationTitle = p.Employee.Designation.Title,
                Month = p.Month, Year = p.Year,
                BasicSalary = p.BasicSalary, HouseRentAllowance = p.HouseRentAllowance,
                MedicalAllowance = p.MedicalAllowance, TransportAllowance = p.TransportAllowance,
                OtherAllowance = p.OtherAllowance, GrossSalary = p.GrossSalary,
                TotalBonus = p.TotalBonus, TotalDeduction = p.TotalDeduction,
                ProvidentFund = p.ProvidentFund, TaxAmount = p.TaxAmount,
                OvertimePay = p.OvertimePay, NetSalary = p.NetSalary,
                WorkingDays = p.WorkingDays, PresentDays = p.PresentDays, LeaveDays = p.LeaveDays,
                Status = p.Status.ToString(), ApprovedAt = p.ApprovedAt, ApprovedBy = p.ApprovedBy
            }).ToListAsync();
        return Ok(result);
    }

    [HttpPost("generate")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Generate(GeneratePayrollDto dto)
    {
        var empQ = _db.Employees.Include(e => e.Salary).ThenInclude(s => s!.Bonuses).Include(e => e.Salary!.Deductions).AsQueryable();
        if (dto.DepartmentId.HasValue) empQ = empQ.Where(e => e.DepartmentId == dto.DepartmentId);
        var employees = await empQ.Where(e => e.Status == EmploymentStatus.Active && e.Salary != null).ToListAsync();

        int workingDays = DateTime.DaysInMonth(dto.Year, dto.Month);
        var generated = new List<PayrollDto>();

        foreach (var emp in employees)
        {
            var exists = await _db.Payrolls.AnyAsync(p => p.EmployeeId == emp.Id && p.Month == dto.Month && p.Year == dto.Year);
            if (exists) continue;

            var s = emp.Salary!;
            var attendance = await _db.Attendances.Where(a => a.EmployeeId == emp.Id && a.Date.Month == dto.Month && a.Date.Year == dto.Year).ToListAsync();
            var leaveDays = await _db.Leaves.Where(l => l.EmployeeId == emp.Id && l.Status == LeaveStatus.Approved && l.StartDate.Month == dto.Month && l.StartDate.Year == dto.Year).SumAsync(l => (int?)l.TotalDays) ?? 0;
            var presentDays = attendance.Count(a => a.Status == AttendanceStatus.Present || a.Status == AttendanceStatus.Late);
            var overtimeHours = attendance.Sum(a => a.OvertimeHours);
            var overtimePay = overtimeHours > 0 ? (s.BasicSalary / 22 / 8) * overtimeHours : 0;

            var gross = s.BasicSalary + s.HouseRentAllowance + s.MedicalAllowance + s.TransportAllowance + s.OtherAllowance;
            var bonuses = s.Bonuses.Where(b => !b.IsDeleted && b.BonusDate.Month == dto.Month && b.BonusDate.Year == dto.Year).Sum(b => b.Amount);
            var deductions = s.Deductions.Where(d => !d.IsDeleted && d.DeductionDate.Month == dto.Month && d.DeductionDate.Year == dto.Year).Sum(d => d.Amount);
            var net = gross + bonuses + overtimePay - s.ProvidentFund - s.TaxAmount - deductions;

            var payroll = new Payroll
            {
                EmployeeId = emp.Id, Month = dto.Month, Year = dto.Year,
                BasicSalary = s.BasicSalary, HouseRentAllowance = s.HouseRentAllowance,
                MedicalAllowance = s.MedicalAllowance, TransportAllowance = s.TransportAllowance,
                OtherAllowance = s.OtherAllowance, GrossSalary = gross,
                TotalBonus = bonuses, TotalDeduction = deductions,
                ProvidentFund = s.ProvidentFund, TaxAmount = s.TaxAmount,
                OvertimePay = Math.Round(overtimePay, 2), NetSalary = Math.Round(net, 2),
                WorkingDays = workingDays, PresentDays = presentDays, LeaveDays = leaveDays,
                Status = PayrollStatus.Draft, CreatedBy = User.Identity?.Name
            };
            _db.Payrolls.Add(payroll);
        }
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Payroll generated for {employees.Count} employees" });
    }

    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Approve(int id)
    {
        var p = await _db.Payrolls.FindAsync(id);
        if (p == null) return NotFound();
        p.Status = PayrollStatus.Approved; p.ApprovedAt = DateTime.UtcNow; p.ApprovedBy = User.Identity?.Name;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Payroll approved" });
    }

    [HttpPut("{id}/mark-paid")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> MarkPaid(int id)
    {
        var p = await _db.Payrolls.FindAsync(id);
        if (p == null) return NotFound();
        p.Status = PayrollStatus.Paid; p.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Payroll marked as paid" });
    }

    [HttpGet("{id}/payslip")]
    public async Task<IActionResult> GetPayslip(int id)
    {
        var p = await _db.Payrolls.Include(x => x.Employee).ThenInclude(e => e.Department)
            .Include(x => x.Employee.Designation).FirstOrDefaultAsync(x => x.Id == id);
        if (p == null) return NotFound();
        return Ok(new PayrollDto
        {
            Id = p.Id, EmployeeId = p.EmployeeId,
            EmployeeName = p.Employee.FirstName + " " + p.Employee.LastName,
            EmployeeCode = p.Employee.EmployeeCode, DepartmentName = p.Employee.Department.Name,
            DesignationTitle = p.Employee.Designation.Title, Month = p.Month, Year = p.Year,
            BasicSalary = p.BasicSalary, HouseRentAllowance = p.HouseRentAllowance,
            MedicalAllowance = p.MedicalAllowance, TransportAllowance = p.TransportAllowance,
            OtherAllowance = p.OtherAllowance, GrossSalary = p.GrossSalary,
            TotalBonus = p.TotalBonus, TotalDeduction = p.TotalDeduction,
            ProvidentFund = p.ProvidentFund, TaxAmount = p.TaxAmount,
            OvertimePay = p.OvertimePay, NetSalary = p.NetSalary,
            WorkingDays = p.WorkingDays, PresentDays = p.PresentDays, LeaveDays = p.LeaveDays,
            Status = p.Status.ToString(), ApprovedAt = p.ApprovedAt, ApprovedBy = p.ApprovedBy
        });
    }
}
