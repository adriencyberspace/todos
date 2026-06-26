using AwesomeAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;
using TodoApi.Api.Data;
using TodoApi.Api.Dtos;
using TodoApi.Api.Models;
using TodoApi.Api.Services;

namespace TodoApi.UnitTests.Services;

public class TodoServiceTests
{
    private static TodoContext CreateContext() =>
        new(new DbContextOptionsBuilder<TodoContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    [Fact]
    public async Task Create_SetsDefaults()
    {
        //given
        using var ctx = CreateContext();
        var service = new TodoService(ctx);
        var request = new CreateTodoRequest("Buy milk", null, null, Priority.Medium);

        //when
        var response = await service.CreateAsync(request, CancellationToken.None);

        //then
        response.IsCompleted.Should().BeFalse();
        response.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        response.Priority.Should().Be(Priority.Medium);
    }

    [Fact]
    public async Task Complete_SetsIsCompletedAndCompletedAt()
    {
        //given
        using var ctx = CreateContext();
        var todo = new Todo { Title = "Test", CreatedAt = DateTime.UtcNow };
        ctx.Todos.Add(todo);
        await ctx.SaveChangesAsync(TestContext.Current.CancellationToken);
        var service = new TodoService(ctx);

        //when
        var response = await service.CompleteAsync(todo.Id, CancellationToken.None);

        //then
        response.Should().NotBeNull();
        response!.IsCompleted.Should().BeTrue();
        response.CompletedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task Complete_IsIdempotent_DoesNotChangeCompletedAt()
    {
        //given
        using var ctx = CreateContext();
        var originalCompletedAt = DateTime.UtcNow.AddHours(-1);
        var todo = new Todo
        {
            Title = "Test",
            CreatedAt = DateTime.UtcNow.AddHours(-2),
            IsCompleted = true,
            CompletedAt = originalCompletedAt,
        };
        ctx.Todos.Add(todo);
        await ctx.SaveChangesAsync(TestContext.Current.CancellationToken);
        var service = new TodoService(ctx);

        //when
        var response = await service.CompleteAsync(todo.Id, CancellationToken.None);

        //then
        response!.CompletedAt.Should().Be(originalCompletedAt);
    }

    [Fact]
    public async Task GetAll_FilterByCompleted_ReturnsOnlyMatchingTodos()
    {
        //given
        using var ctx = CreateContext();
        await ctx.Todos.AddRangeAsync(
            new Todo { Title = "Done", CreatedAt = DateTime.UtcNow, IsCompleted = true },
            new Todo { Title = "Pending", CreatedAt = DateTime.UtcNow, IsCompleted = false }
        );
        await ctx.SaveChangesAsync(TestContext.Current.CancellationToken);
        var service = new TodoService(ctx);

        //when
        var items = await service.GetAllAsync(completed: true, priority: null, CancellationToken.None);

        //then
        items.Should().HaveCount(1);
        items[0].Title.Should().Be("Done");
    }

    [Fact]
    public async Task GetAll_FilterByPriority_ReturnsOnlyMatchingTodos()
    {
        //given
        using var ctx = CreateContext();
        await ctx.Todos.AddRangeAsync(
            new Todo { Title = "High priority", CreatedAt = DateTime.UtcNow, Priority = Priority.High },
            new Todo { Title = "Low priority", CreatedAt = DateTime.UtcNow, Priority = Priority.Low }
        );
        await ctx.SaveChangesAsync(TestContext.Current.CancellationToken);
        var service = new TodoService(ctx);

        //when
        var items = await service.GetAllAsync(completed: null, priority: Priority.High, CancellationToken.None);

        //then
        items.Should().HaveCount(1);
        items[0].Title.Should().Be("High priority");
    }

    [Fact]
    public async Task Delete_RemovesTodo()
    {
        //given
        using var ctx = CreateContext();
        var todo = new Todo { Title = "To delete", CreatedAt = DateTime.UtcNow };
        ctx.Todos.Add(todo);
        await ctx.SaveChangesAsync(TestContext.Current.CancellationToken);
        var service = new TodoService(ctx);

        //when
        var deleted = await service.DeleteAsync(todo.Id, CancellationToken.None);

        //then
        deleted.Should().BeTrue();
        var result = await service.GetByIdAsync(todo.Id, CancellationToken.None);
        result.Should().BeNull();
    }
}
