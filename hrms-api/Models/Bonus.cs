namespace hrms_api.Models;

public class Bonus : AuditEntity
{
    public int Id { get; set; }
    public int SalaryId { get; set; }
    public Salary Salary { get; set; } = null!;
    public string BonusType { get; set; } = string.Empty; // Festival, Performance, Others
    public decimal Amount { get; set; }
    public string? Remarks { get; set; }
    public DateTime BonusDate { get; set; }
}
