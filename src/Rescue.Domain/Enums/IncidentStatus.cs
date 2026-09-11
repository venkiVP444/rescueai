namespace Rescue.Domain.Enums;

public enum IncidentStatus
{
    Detected = 0,
    Investigating = 1,
    Correlating = 2,
    FixProposed = 3,
    AwaitingApproval = 4,
    Deploying = 5,
    Verifying = 6,
    Resolved = 7,
    Rejected = 8
}
