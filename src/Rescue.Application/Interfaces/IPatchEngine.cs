using Rescue.Domain.Entities;

namespace Rescue.Application.Interfaces;

public interface IPatchEngine
{
    ProposedPatch GenerateApiMigrationPatch(ApiChange apiChange);
    ProposedPatch GenerateRedisConfigPatch(Incident incident);
}
