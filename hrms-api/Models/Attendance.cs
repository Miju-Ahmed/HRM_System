namespace hrms_api.Models;

public enum AttendanceStatus { Present, Absent, Late, HalfDay, OnLeave }

public class Attendance : AuditEntity
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
    public DateTime Date { get; set; }
    public DateTime? CheckIn { get; set; }
    public DateTime? CheckOut { get; set; }
    public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;
    public decimal WorkingHours { get; set; }
    public decimal OvertimeHours { get; set; }
    public string? Remarks { get; set; }
}
