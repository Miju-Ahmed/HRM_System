namespace hrms_api.Models;

public class Salary : AuditEntity
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
    public decimal BasicSalary { get; set; }
    public decimal HouseRentAllowance { get; set; }
    public decimal MedicalAllowance { get; set; }
    public decimal TransportAllowance { get; set; }
    public decimal OtherAllowance { get; set; }
    public decimal ProvidentFund { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal GrossSalary =>
        BasicSalary + HouseRentAllowance + MedicalAllowance + TransportAllowance + OtherAllowance;
    public decimal NetSalary =>
        GrossSalary - ProvidentFund - TaxAmount;
    public DateTime EffectiveFrom { get; set; }

    // Navigation
    public ICollection<SalaryRevision> Revisions { get; set; } = new List<SalaryRevision>();
    public ICollection<Bonus> Bonuses { get; set; } = new List<Bonus>();
    public ICollection<Deduction> Deductions { get; set; } = new List<Deduction>();
}
