using System.Threading.Tasks;

namespace Rescue.Application.Interfaces;

public interface IEventNotificationService
{
    Task BroadcastEventAsync(string eventName, object payload);
}
