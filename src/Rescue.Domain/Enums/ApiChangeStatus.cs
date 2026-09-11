namespace Rescue.Domain.Enums;

public enum ApiChangeStatus
{
    Detected = 0,
    Analyzed = 1,
    FixProposed = 2,
    PendingApproval = 3,
    Approved = 4,
    Migrated = 5
}
