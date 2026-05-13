namespace hrms_api.DTOs;

// ── Auth ──────────────────────────────────────────────────────────────────────
public record RegisterDto(string FullName, string Email, string Password, string Role = "Employee");
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Token, string RefreshToken, string FullName, string Email, string Role, int? EmployeeId);
public record ChangePasswordDto(string CurrentPassword, string NewPassword);
public record ForgotPasswordDto(string Email);
public record ResetPasswordDto(string Email, string Token, string NewPassword);

// ── Department ────────────────────────────────────────────────────────────────
public record DepartmentDto(int Id, string Name, string? Description, int? ParentDepartmentId, string? ParentDepartmentName, int EmployeeCount);
public record CreateDepartmentDto(string Name, string? Description, int? ParentDepartmentId);
public record UpdateDepartmentDto(string Name, string? Description, int? ParentDepartmentId);

// ── Designation ───────────────────────────────────────────────────────────────
public record DesignationDto(int Id, string Title, string? Description, int DepartmentId, string DepartmentName, int EmployeeCount);
public record CreateDesignationDto(string Title, string? Description, int DepartmentId);
public record UpdateDesignationDto(string Title, string? Description, int DepartmentId);

// ── Employee ──────────────────────────────────────────────────────────────────
public class EmployeeListDto
{
    public int Id { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string DesignationTitle { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public DateTime JoiningDate { get; set; }
    public string? ProfileImagePath { get; set; }
    public decimal? BasicSalary { get; set; }
}

public class EmployeeDetailDto : EmployeeListDto
{
    public string? Address { get; set; }
    public DateTime DateOfBirth { get; set; }
    public int DepartmentId { get; set; }
    public int DesignationId { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? EmergencyContact { get; set; }
    public string? NationalId { get; set; }
}

public class CreateEmployeeDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string Gender { get; set; } = "Male";
    public DateTime DateOfBirth { get; set; }
    public DateTime JoiningDate { get; set; }
    public int DepartmentId { get; set; }
    public int DesignationId { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? EmergencyContact { get; set; }
    public string? NationalId { get; set; }
    public string Status { get; set; } = "Active";
}

public class UpdateEmployeeDto : CreateEmployeeDto { }

// ── Salary ────────────────────────────────────────────────────────────────────
public class SalaryDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public decimal BasicSalary { get; set; }
    public decimal HouseRentAllowance { get; set; }
    public decimal MedicalAllowance { get; set; }
    public decimal TransportAllowance { get; set; }
    public decimal OtherAllowance { get; set; }
    public decimal ProvidentFund { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal GrossSalary { get; set; }
    public decimal NetSalary { get; set; }
    public DateTime EffectiveFrom { get; set; }
}

public class SetSalaryDto
{
    public decimal BasicSalary { get; set; }
    public decimal HouseRentAllowance { get; set; }
    public decimal MedicalAllowance { get; set; }
    public decimal TransportAllowance { get; set; }
    public decimal OtherAllowance { get; set; }
    public decimal ProvidentFund { get; set; }
    public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;
    public string? RevisionReason { get; set; }
}

public class BonusDto
{
    public int Id { get; set; }
    public string BonusType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Remarks { get; set; }
    public DateTime BonusDate { get; set; }
}

public class CreateBonusDto
{
    public string BonusType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Remarks { get; set; }
    public DateTime BonusDate { get; set; } = DateTime.UtcNow;
}

public class DeductionDto
{
    public int Id { get; set; }
    public string DeductionType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Remarks { get; set; }
    public DateTime DeductionDate { get; set; }
}

public class CreateDeductionDto
{
    public string DeductionType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Remarks { get; set; }
    public DateTime DeductionDate { get; set; } = DateTime.UtcNow;
}

public class SalaryRevisionDto
{
    public int Id { get; set; }
    public decimal OldBasicSalary { get; set; }
    public decimal NewBasicSalary { get; set; }
    public decimal OldGrossSalary { get; set; }
    public decimal NewGrossSalary { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime RevisionDate { get; set; }
    public string RevisedBy { get; set; } = string.Empty;
}

// ── Payroll ───────────────────────────────────────────────────────────────────
public class PayrollDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string DesignationTitle { get; set; } = string.Empty;
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal BasicSalary { get; set; }
    public decimal HouseRentAllowance { get; set; }
    public decimal MedicalAllowance { get; set; }
    public decimal TransportAllowance { get; set; }
    public decimal OtherAllowance { get; set; }
    public decimal GrossSalary { get; set; }
    public decimal TotalBonus { get; set; }
    public decimal TotalDeduction { get; set; }
    public decimal ProvidentFund { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal OvertimePay { get; set; }
    public decimal NetSalary { get; set; }
    public int WorkingDays { get; set; }
    public int PresentDays { get; set; }
    public int LeaveDays { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? ApprovedAt { get; set; }
    public string? ApprovedBy { get; set; }
}

public class GeneratePayrollDto
{
    public int Month { get; set; }
    public int Year { get; set; }
    public int? DepartmentId { get; set; }
}

// ── Attendance ────────────────────────────────────────────────────────────────
public class AttendanceDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public DateTime? CheckIn { get; set; }
    public DateTime? CheckOut { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal WorkingHours { get; set; }
    public decimal OvertimeHours { get; set; }
    public string? Remarks { get; set; }
}

public class CheckInDto { public int EmployeeId { get; set; } public string? Remarks { get; set; } }
public class CheckOutDto { public int EmployeeId { get; set; } public string? Remarks { get; set; } }

// ── Leave ─────────────────────────────────────────────────────────────────────
public class LeaveTypeDto { public int Id { get; set; } public string Name { get; set; } = string.Empty; public int MaxDaysPerYear { get; set; } }

public class LeaveDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string LeaveTypeName { get; set; } = string.Empty;
    public int LeaveTypeId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalDays { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ReviewedBy { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewRemarks { get; set; }
    public DateTime AppliedAt { get; set; }
}

public class ApplyLeaveDto
{
    public int EmployeeId { get; set; }
    public int LeaveTypeId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class ReviewLeaveDto { public string Action { get; set; } = "Approve"; public string? Remarks { get; set; } }

public class LeaveBalanceDto
{
    public string LeaveTypeName { get; set; } = string.Empty;
    public int MaxDays { get; set; }
    public int UsedDays { get; set; }
    public int RemainingDays { get; set; }
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
// ── Dashboard Role Based DTOs ────────────────────────────────────────────────
// Admin
public class AdminSummaryDto { public int TotalEmployees {get;set;} public int ActiveEmployees {get;set;} public int InactiveEmployees {get;set;} public int TotalDepartments {get;set;} public decimal TotalPayrollThisMonth {get;set;} public int TotalPendingLeaves {get;set;} public int TotalAttendanceToday {get;set;} public int TotalHrUsers {get;set;} public decimal TotalSalaryExpense {get;set;} public int NewEmployeesThisMonth {get;set;} }
public class AdminChartsDto { public List<dynamic> EmployeesByDepartment {get;set;} = new(); public List<dynamic> EmployeesByDesignation {get;set;} = new(); public List<dynamic> GenderDistribution {get;set;} = new(); public List<dynamic> PayrollTrend {get;set;} = new(); }
public class ActivityDto { public string Description {get;set;} = ""; public DateTime Timestamp {get;set;} public string Type {get;set;} = ""; }

// HR
public class HrSummaryDto { public int TotalEmployees {get;set;} public int ActiveEmployees {get;set;} public int TodayAttendance {get;set;} public int PendingLeaves {get;set;} public int NewJoiners {get;set;} public int EmployeesOnLeaveToday {get;set;} }
public class HrChartsDto { public List<dynamic> AttendanceSummary {get;set;} = new(); public List<dynamic> LeaveTrends {get;set;} = new(); }
public class HrTaskDto { public string TaskName {get;set;} = ""; public string Priority {get;set;} = ""; public string ActionLink {get;set;} = ""; }

// Employee
public class EmpSummaryDto { public EmployeeDetailDto? Profile {get;set;} public decimal CurrentSalary {get;set;} public int LeaveBalance {get;set;} public int PendingLeaves {get;set;} }
public class EmpAttendanceDto { public int PresentDays {get;set;} public int AbsentDays {get;set;} public int LateDays {get;set;} public List<dynamic> MonthlyChart {get;set;} = new(); }
public class EmpSalaryDto { public decimal Basic {get;set;} public decimal Deductions {get;set;} public decimal Bonuses {get;set;} public decimal Net {get;set;} public List<PayrollDto> RecentPayslips {get;set;} = new(); }
public class EmpLeaveDto { public int Used {get;set;} public int Remaining {get;set;} public List<LeaveDto> History {get;set;} = new(); }

// ── Notifications ─────────────────────────────────────────────────────────────
public class NotificationDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Link { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ── Pagination Wrapper ────────────────────────────────────────────────────────
public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}
