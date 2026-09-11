using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace Rescue.Api.Controllers;

[ApiController]
[Route("api/system-explorer")]
public class SystemExplorerController : ControllerBase
{
    [HttpGet]
    public IActionResult GetSystemExplorer()
    {
        var dependencies = new List<object>
        {
            new { source = "API Gateway", target = "OrderService", type = "HTTP/REST" },
            new { source = "API Gateway", target = "UserService", type = "HTTP/REST" },
            new { source = "OrderService", target = "PaymentService", type = "HTTP/REST" },
            new { source = "OrderService", target = "InventoryService", type = "gRPC" },
            new { source = "PaymentService", target = "Redis Cluster", type = "TCP:6379" },
            new { source = "PaymentService", target = "PostgreSQL", type = "TCP:5432" },
            new { source = "PaymentService", target = "Acme Payments API", type = "HTTPS:443" },
            new { source = "OrderService", target = "NotificationService", type = "RabbitMQ" }
        };

        var configs = new List<object>
        {
            new { name = "payment-production.json", service = "PaymentService", keys = new[] { "RedisConfig.MaxPoolSize", "ExternalPaymentApi.Version" } },
            new { name = "redis-production.json", service = "Redis Cluster", keys = new[] { "MaxClients", "EvictionPolicy" } },
            new { name = "gateway-production.json", service = "API Gateway", keys = new[] { "RateLimits.Payments", "RateLimits.Orders" } }
        };

        var runbooks = new List<object>
        {
            new { id = "RBK-001", title = "PaymentService HTTP 503 Outage", service = "PaymentService" },
            new { id = "RBK-002", title = "Redis Connection Pool Exhaustion", service = "PaymentService" },
            new { id = "RBK-003", title = "Deployment Rollback", service = "Platform" },
            new { id = "RBK-004", title = "Handling Upstream API Breaking Changes", service = "PaymentService" }
        };

        return Ok(new
        {
            dependencies,
            configs,
            runbooks
        });
    }
}
