namespace hrms_api.Models;

public class LeaveType : AuditEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // Sick, Casual, Annual
    public int MaxDaysPerYear { get; set; }
    public string? Description { get; set; }
    public ICollection<Leave> Leaves { get; set; } = new List<Leave>();
}
