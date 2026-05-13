namespace hrms_api.Models;

public class SalaryRevision : AuditEntity
{
    public int Id { get; set; }
    public int SalaryId { get; set; }
    public Salary Salary { get; set; } = null!;
    public decimal OldBasicSalary { get; set; }
    public decimal NewBasicSalary { get; set; }
    public decimal OldGrossSalary { get; set; }
    public decimal NewGrossSalary { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime RevisionDate { get; set; }
    public string RevisedBy { get; set; } = string.Empty;
}
