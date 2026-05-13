namespace hrms_api.Models;

public class Notification : AuditEntity
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public AppUser User { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public string? Link { get; set; }
    public string Type { get; set; } = "info"; // info, success, warning, danger
}
