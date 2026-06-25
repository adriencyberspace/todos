using System.Diagnostics.CodeAnalysis;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TodoApi.Api.Infrastructure.OpenApi
{
    [ExcludeFromCodeCoverage]
    public static class OpenApiRegistrations
    {
        public static void AddOpenApi(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddOpenApi(options =>
            {
                options.AddDocumentTransformer((document, context, cancellationToken) =>
                {
                    document.Info.Title = "TodoApi";
                    document.Info.Description = "A simple local-dev Todo API";
                    return Task.CompletedTask;
                });
            });
        }
    }
}
