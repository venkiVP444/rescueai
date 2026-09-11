using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace Rescue.Api.Controllers;

[ApiController]
[Route("api/approvals")]
public class ApprovalsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetApprovals()
    {
        var approvals = new List<object>
        {
            new
            {
                id = "APP-105",
                incidentId = "INC-105",
                title = "PaymentService API v4.2 customerId Contract Migration",
                risk = "Low",
                confidence = 96,
                proposedChange = "customer_id -> customerId in ApiClient.cs",
                status = "Pending"
            }
        };

        return Ok(approvals);
    }
}
