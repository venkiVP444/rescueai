using System.Collections.Generic;
using Rescue.Domain.Entities;
using Rescue.Domain.Enums;

namespace Rescue.Application.Interfaces;

public interface IRiskAssessmentEngine
{
    RiskLevel CalculateRisk(ProposedPatch patch, List<string> affectedServices);
}
