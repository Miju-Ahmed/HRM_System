namespace hrms_api.Models;

public enum EmploymentStatus { Active, Inactive, Resigned, Terminated }
public enum Gender { Male, Female, Other }

public class Employee : AuditEntity
{
    public int Id { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Address { get; set; }
    public Gender Gender { get; set; }
    public DateTime DateOfBirth { get; set; }
    public DateTime JoiningDate { get; set; }
    public int DepartmentId { get; set; }
    public Department Department { get; set; } = null!;
    public int DesignationId { get; set; }
    public Designation Designation { get; set; } = null!;
    public EmploymentStatus Status { get; set; } = EmploymentStatus.Active;
    public string? BankAccountNumber { get; set; }
    public string? EmergencyContact { get; set; }
    public string? NationalId { get; set; }
    public string? ProfileImagePath { get; set; }

    // Navigation
    public Salary? Salary { get; set; }
    public ICollection<Payroll> Payrolls { get; set; } = new List<Payroll>();
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    public ICollection<Leave> Leaves { get; set; } = new List<Leave>();
    public AppUser? User { get; set; }
}
