using System;

namespace Rescue.Sdk;

public class RescueClientOptions
{
    public string Endpoint { get; set; } = "http://localhost:5105";
    public string ProjectId { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string Environment { get; set; } = "production";
    public string Service { get; set; } = string.Empty;
    public bool NonBlocking { get; set; } = true;
    public TimeSpan Timeout { get; set; } = TimeSpan.FromSeconds(3);
}
