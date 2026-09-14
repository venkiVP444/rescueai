using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Rescue.Api.Controllers;

public class PlatformSettingsDto
{
    public string CorrelationWindow { get; set; } = "15";
    public string ErrorThreshold { get; set; } = "5.0";
    public string ConfidenceThreshold { get; set; } = "85";
    public bool AutoRedactPii { get; set; } = true;
    public bool IsolateProjects { get; set; } = true;
    public string GitHubRepo { get; set; } = "https://github.com/venkiVP444/rescueai";
    public string ActiveEnvironment { get; set; } = "production";
    public string DefaultBranch { get; set; } = "main";
    public string HotfixBranchPrefix { get; set; } = "rescue/";
    public string SlackWebhookUrl { get; set; } = string.Empty;
    public string PagerDutyRoutingKey { get; set; } = string.Empty;
}

[ApiController]
[Route("api/settings")]
public class SettingsController : ControllerBase
{
    private static readonly object _lock = new();
    private static PlatformSettingsDto _cachedSettings = new();
    private const string SettingsFilePath = "settings.json";

    static SettingsController()
    {
        try
        {
            if (System.IO.File.Exists(SettingsFilePath))
            {
                var json = System.IO.File.ReadAllText(SettingsFilePath);
                var loaded = JsonSerializer.Deserialize<PlatformSettingsDto>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                if (loaded != null)
                {
                    _cachedSettings = loaded;
                }
            }
        }
        catch
        {
            // Fall back to default in-memory settings
        }
    }

    [HttpGet]
    public IActionResult GetSettings()
    {
        lock (_lock)
        {
            return Ok(_cachedSettings);
        }
    }

    [HttpPost]
    public async Task<IActionResult> SaveSettings([FromBody] PlatformSettingsDto settings)
    {
        if (settings == null)
        {
            return BadRequest("Invalid settings payload");
        }

        lock (_lock)
        {
            _cachedSettings = settings;
        }

        try
        {
            var json = JsonSerializer.Serialize(settings, new JsonSerializerOptions { WriteIndented = true });
            await System.IO.File.WriteAllTextAsync(SettingsFilePath, json);
        }
        catch
        {
            // In-memory update succeeded even if disk write fails
        }

        return Ok(new
        {
            success = true,
            message = "Settings saved successfully",
            settings = _cachedSettings
        });
    }
}
