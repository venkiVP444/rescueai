using System;
using Microsoft.Extensions.DependencyInjection;

namespace Rescue.Sdk;

public static class RescueServiceExtensions
{
    public static IServiceCollection AddRescue(this IServiceCollection services, Action<RescueClientOptions> configure)
    {
        var options = new RescueClientOptions();
        configure(options);

        services.AddSingleton(options);
        services.AddHttpClient<IRescueClient, RescueClient>();
        return services;
    }
}
