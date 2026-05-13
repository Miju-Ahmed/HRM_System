namespace hrms_api.Models;

public class Deduction : AuditEntity
{
    public int Id { get; set; }
    public int SalaryId { get; set; }
    public Salary Salary { get; set; } = null!;
    public string DeductionType { get; set; } = string.Empty; // Tax, Loan, Absence, Others
    public decimal Amount { get; set; }
    public string? Remarks { get; set; }
    public DateTime DeductionDate { get; set; }
}
