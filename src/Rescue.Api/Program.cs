using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Rescue.Api.Hubs;
using Rescue.Api.Services;
using Rescue.Application.Interfaces;
using Rescue.Application.Services;
using Rescue.Domain.Interfaces;
using Rescue.Infrastructure.Integrations;
using Rescue.Infrastructure.Persistence;
using Rescue.Infrastructure.Retrieval;

var builder = WebApplication.CreateBuilder(args);

// Controllers with string enum conversion
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// Real-time SignalR
builder.Services.AddSignalR();

// Permissive CORS for local Vite dev server (port 5173) and production build
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddHttpClient();

// SQLite EF Core persistence
builder.Services.AddDbContext<RescueDbContext>(options =>
{
    options.UseSqlite("Data Source=rescue.db");
});

// Domain & Infrastructure DI Registration
builder.Services.AddSingleton<IMossRetrievalService, MossRetrievalService>();
builder.Services.AddScoped<IMemoryService, Rescue.Infrastructure.Services.MemoryService>();
builder.Services.AddScoped<IProjectService, Rescue.Infrastructure.Services.ProjectService>();
builder.Services.AddScoped<IGenericIncidentEngine, GenericIncidentEngine>();
builder.Services.AddScoped<IEventIngestionService, Rescue.Infrastructure.Services.EventIngestionService>();
builder.Services.AddScoped<IRepositoryProvider, GitHubRepositoryProvider>();
builder.Services.AddScoped<IIncidentCorrelationEngine, IncidentCorrelationEngine>();
builder.Services.AddScoped<IPatchEngine, PatchEngine>();
builder.Services.AddScoped<IValidationEngine, ValidationEngine>();
builder.Services.AddScoped<IRiskAssessmentEngine, RiskAssessmentEngine>();
builder.Services.AddScoped<IGitHubService, GitHubService>();
builder.Services.AddScoped<IDeploymentVerificationService, StagingDeploymentSimulator>();
builder.Services.AddScoped<IEventNotificationService, SignalREventNotificationService>();
builder.Services.AddScoped<IApiChangeEngine, ApiChangeEngine>();
builder.Services.AddScoped<IInvestigationOrchestrator, InvestigationOrchestrator>();

var app = builder.Build();

app.UseCors();
app.MapControllers();
app.MapHub<RescueHub>("/hubs/rescue");

// Auto-migrate SQLite schema and seed baseline memories and default project
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<RescueDbContext>();
    db.Database.EnsureCreated();
    var memoryService = scope.ServiceProvider.GetRequiredService<IMemoryService>();
    await memoryService.SeedBaselineMemoriesAsync();
    var projectService = scope.ServiceProvider.GetRequiredService<IProjectService>();
    await projectService.SeedDefaultProjectAsync();
}

app.Run();
