using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Rescue.Api.Hubs;
using Rescue.Application.Interfaces;

namespace Rescue.Api.Services;

public class SignalREventNotificationService : IEventNotificationService
{
    private readonly IHubContext<RescueHub> _hubContext;

    public SignalREventNotificationService(IHubContext<RescueHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task BroadcastEventAsync(string eventName, object payload)
    {
        await _hubContext.Clients.All.SendAsync(eventName, payload);
    }
}
