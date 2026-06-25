using Serilog.Core;
using Serilog.Events;
using System.Reflection;

namespace TodoApi.Api.Infrastructure.Logging;

public class VersionEnricher : ILogEventEnricher
{
    private static readonly string _version =
        Environment.GetEnvironmentVariable("VERSION")
        ?? typeof(VersionEnricher).Assembly.GetName().Version?.ToString()
        ?? "unknown";

    private static readonly string _sha =
        Environment.GetEnvironmentVariable("SHA") ?? "unknown";

    public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
    {
        logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("VERSION", _version));
        logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("SHA", _sha));
    }
}
