using System;

namespace Rescue.Domain.Entities;

public class ApprovalRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public string? Approver { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? DecisionNotes { get; set; }
}
