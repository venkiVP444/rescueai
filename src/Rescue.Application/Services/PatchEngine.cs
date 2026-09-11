using System;
using Rescue.Application.Interfaces;
using Rescue.Domain.Entities;
using Rescue.Domain.Enums;

namespace Rescue.Application.Services;

public class PatchEngine : IPatchEngine
{
    public ProposedPatch GenerateApiMigrationPatch(ApiChange apiChange)
    {
        var oldCode = @"            var payload = new
            {
                customer_id = request.CustomerId,
                amount = request.Amount,
                currency = request.Currency
            };";

        var newCode = @"            var payload = new
            {
                customerId = request.CustomerId,
                amount = request.Amount,
                currency = request.Currency
            };";

        var diff = @"--- a/src/AcmeCommerce.PaymentService/Infrastructure/ApiClient.cs
+++ b/src/AcmeCommerce.PaymentService/Infrastructure/ApiClient.cs
@@ -28,3 +28,3 @@
             var payload = new
             {
-                customer_id = request.CustomerId,
+                customerId = request.CustomerId,
                 amount = request.Amount,
                 currency = request.Currency
             };";

        return new ProposedPatch
        {
            FilePath = "src/AcmeCommerce.PaymentService/Infrastructure/ApiClient.cs",
            OldContent = oldCode,
            NewContent = newCode,
            UnifiedDiff = diff,
            Explanation = "Migrate deprecated request property 'customer_id' to 'customerId' conforming with Acme Payments External Gateway API v4.2 specification.",
            Risk = RiskLevel.Low,
            RollbackPlan = "1. Revert Git commit or PR rescue/INC-105-api-migration\n2. Redeploy previous container image v1.8.2\n3. Enable temporary API Gateway compatibility layer if available.",
            IsApplied = false
        };
    }

    public ProposedPatch GenerateRedisConfigPatch(Incident incident)
    {
        var oldConfig = @"  ""RedisConfig"": {
    ""Host"": ""redis-cluster.production.internal"",
    ""Port"": 6379,
    ""MaxPoolSize"": 50,
    ""ConnectTimeoutMs"": 1500,
    ""SyncTimeoutMs"": 1000
  }";

        var newConfig = @"  ""RedisConfig"": {
    ""Host"": ""redis-cluster.production.internal"",
    ""Port"": 6379,
    ""MaxPoolSize"": 200,
    ""ConnectTimeoutMs"": 1500,
    ""SyncTimeoutMs"": 1000
  }";

        var diff = @"--- a/configs/payment-production.json
+++ b/configs/payment-production.json
@@ -5,3 +5,3 @@
     ""Port"": 6379,
-    ""MaxPoolSize"": 50,
+    ""MaxPoolSize"": 200,
     ""ConnectTimeoutMs"": 1500,";

        return new ProposedPatch
        {
            FilePath = "configs/payment-production.json",
            OldContent = oldConfig,
            NewContent = newConfig,
            UnifiedDiff = diff,
            Explanation = "Restore Redis connection pool MaxPoolSize from 50 to 200 to accommodate surge traffic and resolve connection exhaustion 503 errors.",
            Risk = RiskLevel.Low,
            RollbackPlan = "1. Revert payment-production.json MaxPoolSize to 50\n2. Perform rolling pod restart on payment-service deployment.",
            IsApplied = false
        };
    }
}
