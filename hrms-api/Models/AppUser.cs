using Microsoft.AspNetCore.Identity;

namespace hrms_api.Models;

public class AppUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = "Employee";
    public int? EmployeeId { get; set; }
    public Employee? Employee { get; set; }
}
