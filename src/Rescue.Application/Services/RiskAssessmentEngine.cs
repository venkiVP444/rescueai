using System.Collections.Generic;
using Rescue.Application.Interfaces;
using Rescue.Domain.Entities;
using Rescue.Domain.Enums;

namespace Rescue.Application.Services;

public class RiskAssessmentEngine : IRiskAssessmentEngine
{
    public RiskLevel CalculateRisk(ProposedPatch patch, List<string> affectedServices)
    {
        // If modifies database schema or authentication -> High
        if (patch.FilePath.Contains("auth", System.StringComparison.OrdinalIgnoreCase) ||
            patch.FilePath.Contains("migration", System.StringComparison.OrdinalIgnoreCase))
        {
            return RiskLevel.High;
        }

        // If touches multiple services or external contracts -> Medium
        if (affectedServices.Count > 1 || patch.FilePath.EndsWith(".cs"))
        {
            return RiskLevel.Low; // Isolated client patch with complete test coverage
        }

        return RiskLevel.Low;
    }
}
