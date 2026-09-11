using System;
using System.Collections.Generic;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Rescue.Domain.Entities;

namespace Rescue.Infrastructure.Persistence;

public class RescueDbContext : DbContext
{
    public RescueDbContext(DbContextOptions<RescueDbContext> options) : base(options)
    {
    }

    public DbSet<Incident> Incidents => Set<Incident>();
    public DbSet<ApiChange> ApiChanges => Set<ApiChange>();
    public DbSet<MossMetric> MossMetrics => Set<MossMetric>();
    public DbSet<AgentActivity> AgentActivities => Set<AgentActivity>();
    public DbSet<IncidentMemory> IncidentMemories => Set<IncidentMemory>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<RescueEvent> IngestedEvents => Set<RescueEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Services)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>());
        });

        modelBuilder.Entity<RescueEvent>(entity =>
        {
            entity.HasKey(e => e.EventId);
            entity.HasIndex(e => e.ProjectId);
            entity.HasIndex(e => e.EventType);
            entity.HasIndex(e => e.Timestamp);
            entity.Ignore(e => e.Data);
            entity.Ignore(e => e.Correlation);
        });

        modelBuilder.Entity<Incident>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ProjectId);
            entity.Ignore(e => e.Investigation);
            entity.Ignore(e => e.Correlation);
            entity.Ignore(e => e.ProposedPatch);
            entity.Ignore(e => e.ValidationReport);
            entity.Ignore(e => e.Approval);
            entity.Ignore(e => e.GitHubPr);
            entity.Ignore(e => e.Verification);
        });

        modelBuilder.Entity<ApiChange>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Ignore(e => e.ProposedPatch);
            entity.Ignore(e => e.ValidationReport);
            entity.Ignore(e => e.Approval);
            entity.Ignore(e => e.GitHubPr);
            entity.Ignore(e => e.AffectedServices);
            entity.Ignore(e => e.AffectedFiles);
        });

        modelBuilder.Entity<MossMetric>(entity =>
        {
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<AgentActivity>(entity =>
        {
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<IncidentMemory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ProjectId);
            entity.HasIndex(e => e.Service);
            entity.HasIndex(e => e.IncidentId);
            entity.HasIndex(e => e.ResolvedAt);
        });
    }
}
