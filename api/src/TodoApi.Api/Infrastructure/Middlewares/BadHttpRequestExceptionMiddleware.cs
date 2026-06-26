using System.Diagnostics.CodeAnalysis;

namespace TodoApi.Api.Infrastructure.Middlewares;

[ExcludeFromCodeCoverage]
public class BadHttpRequestExceptionMiddleware : IMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (BadHttpRequestException exception)
        {
            var message = exception.Message.Split('.')[0].Trim();
            var errorResponse = new HttpValidationProblemDetails(new Dictionary<string, string[]> { ["Body"] = [message] });
            await context.Response.WriteAsJsonAsync(errorResponse);
        }
    }
}
