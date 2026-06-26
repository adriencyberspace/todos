using System.Diagnostics.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Scalar.AspNetCore;
using TodoApi.Api.Data;
using TodoApi.Api.Infrastructure.Filters;
using TodoApi.Api.Infrastructure.Middlewares;
using TodoApi.Api.Infrastructure.OpenApi;
using TodoApi.Api.Services;

namespace TodoApi.Api
{
    [ExcludeFromCodeCoverage]
    public class Startup
    {
        private readonly IConfiguration _configuration;

        public Startup(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public virtual void ConfigureServices(IServiceCollection services)
        {
            services.ConfigureHttpJsonOptions(options =>
            {
                options.SerializerOptions.RespectNullableAnnotations = true;
                options.SerializerOptions.RespectRequiredConstructorParameters = true;
            });

            services.AddSerilog();
            services
                .AddSingleton<ExceptionMiddleware>()
                .AddSingleton<BadHttpRequestExceptionMiddleware>();

            services
                .AddHttpContextAccessor()
                .AddRouting(options => options.LowercaseUrls = true);

            services.AddMvcCore(options =>
                {
                    options.Filters.Add<HttpGlobalExceptionFilter>();
                })
                .AddApiExplorer()
                .AddDataAnnotations();

            services.AddDbContext<TodoContext>(options =>
                options.UseSqlite(_configuration.GetConnectionString("DefaultConnection")));

            services.AddScoped<ITodoService, TodoService>();

            services.AddOpenApi(_configuration);

            services.AddCors(options =>
            {
                options.AddPolicy("Frontend", policy =>
                    policy.WithOrigins("http://localhost:5173")
                          .AllowAnyHeader()
                          .AllowAnyMethod());
            });
        }

        public virtual void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            using (var scope = app.ApplicationServices.CreateScope())
            {
                scope.ServiceProvider.GetRequiredService<TodoContext>().Database.Migrate();
            }

            app.UseMiddleware<ExceptionMiddleware>();
            app.UseMiddleware<BadHttpRequestExceptionMiddleware>();

            app.UseSerilogRequestLogging();
            app.UseCors("Frontend");

            app.UseRouting();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();

                endpoints.MapOpenApi()
                    .CacheOutput();

                endpoints.MapScalarApiReference("api-doc");
            });
        }
    }
}
