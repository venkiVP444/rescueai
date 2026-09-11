using System.Threading;
using System.Threading.Tasks;
using Rescue.Domain.Entities;

namespace Rescue.Application.Interfaces;

public interface IApiChangeEngine
{
    Task<ApiChange> DetectAndAnalyzeAsync(string apiChangeId = "API-420", CancellationToken cancellationToken = default);
}
