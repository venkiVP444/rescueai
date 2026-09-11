using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace Rescue.Api.Hubs;

public class RescueHub : Hub
{
    public async Task JoinGroup(string groupName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }
}
