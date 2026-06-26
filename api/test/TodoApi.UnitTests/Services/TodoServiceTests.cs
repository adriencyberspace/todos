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
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

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
        var response = await service.CreateAsync(request, Ct);

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
        await ctx.SaveChangesAsync(Ct);
        var service = new TodoService(ctx);

        //when
        var response = await service.CompleteAsync(todo.Id, Ct);

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
        await ctx.SaveChangesAsync(Ct);
        var service = new TodoService(ctx);

        //when
        var response = await service.CompleteAsync(todo.Id, Ct);

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
        await ctx.SaveChangesAsync(Ct);
        var service = new TodoService(ctx);

        //when
        var items = await service.GetAllAsync(completed: true, priority: null, Ct);

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
        await ctx.SaveChangesAsync(Ct);
        var service = new TodoService(ctx);

        //when
        var items = await service.GetAllAsync(completed: null, priority: Priority.High, Ct);

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
        await ctx.SaveChangesAsync(Ct);
        var service = new TodoService(ctx);

        //when
        var deleted = await service.DeleteAsync(todo.Id, Ct);

        //then
        deleted.Should().BeTrue();
        var result = await service.GetByIdAsync(todo.Id, Ct);
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetById_ReturnsTodo_WhenFound()
    {
        //given
        using var ctx = CreateContext();
        var todo = new Todo { Title = "Find me", CreatedAt = DateTime.UtcNow };
        ctx.Todos.Add(todo);
        await ctx.SaveChangesAsync(Ct);
        var service = new TodoService(ctx);

        //when
        var response = await service.GetByIdAsync(todo.Id, Ct);

        //then
        response.Should().NotBeNull();
        response!.Id.Should().Be(todo.Id);
    }

    [Fact]
    public async Task GetById_ReturnsNull_WhenNotFound()
    {
        //given
        using var ctx = CreateContext();
        var service = new TodoService(ctx);

        //when
        var response = await service.GetByIdAsync(Guid.NewGuid(), Ct);

        //then
        response.Should().BeNull();
    }

    [Fact]
    public async Task Update_UpdatesFields_WhenFound()
    {
        //given
        using var ctx = CreateContext();
        var todo = new Todo { Title = "Old title", Priority = Priority.Low, CreatedAt = DateTime.UtcNow };
        ctx.Todos.Add(todo);
        await ctx.SaveChangesAsync(Ct);
        var service = new TodoService(ctx);
        var request = new UpdateTodoRequest("New title", null, null, Priority.High);

        //when
        var response = await service.UpdateAsync(todo.Id, request, Ct);

        //then
        response.Should().NotBeNull();
        response!.Title.Should().Be("New title");
        response.Priority.Should().Be(Priority.High);
    }

    [Fact]
    public async Task Update_ReturnsNull_WhenNotFound()
    {
        //given
        using var ctx = CreateContext();
        var service = new TodoService(ctx);
        var request = new UpdateTodoRequest("Title", null, null, Priority.Medium);

        //when
        var response = await service.UpdateAsync(Guid.NewGuid(), request, Ct);

        //then
        response.Should().BeNull();
    }

    [Fact]
    public async Task Uncomplete_SetsIsCompletedFalseAndClearsCompletedAt()
    {
        //given
        using var ctx = CreateContext();
        var todo = new Todo
        {
            Title = "Done task",
            CreatedAt = DateTime.UtcNow.AddHours(-1),
            IsCompleted = true,
            CompletedAt = DateTime.UtcNow,
        };
        ctx.Todos.Add(todo);
        await ctx.SaveChangesAsync(Ct);
        var service = new TodoService(ctx);

        //when
        var response = await service.UncompleteAsync(todo.Id, Ct);

        //then
        response.Should().NotBeNull();
        response!.IsCompleted.Should().BeFalse();
        response.CompletedAt.Should().BeNull();
    }

    [Fact]
    public async Task Uncomplete_IsIdempotent_DoesNotChangeState()
    {
        //given
        using var ctx = CreateContext();
        var todo = new Todo
        {
            Title = "Not done",
            CreatedAt = DateTime.UtcNow,
            IsCompleted = false,
            CompletedAt = null,
        };
        ctx.Todos.Add(todo);
        await ctx.SaveChangesAsync(Ct);
        var service = new TodoService(ctx);

        //when
        var response = await service.UncompleteAsync(todo.Id, Ct);

        //then
        response!.IsCompleted.Should().BeFalse();
        response.CompletedAt.Should().BeNull();
    }

    [Fact]
    public async Task Delete_ReturnsFalse_WhenNotFound()
    {
        //given
        using var ctx = CreateContext();
        var service = new TodoService(ctx);

        //when
        var deleted = await service.DeleteAsync(Guid.NewGuid(), Ct);

        //then
        deleted.Should().BeFalse();
    }

    [Fact]
    public async Task GetAll_FilterByCompletedAndPriority_ReturnsOnlyMatchingTodos()
    {
        //given
        using var ctx = CreateContext();
        await ctx.Todos.AddRangeAsync(
            new Todo { Title = "Done + High", CreatedAt = DateTime.UtcNow, IsCompleted = true, Priority = Priority.High },
            new Todo { Title = "Done + Low", CreatedAt = DateTime.UtcNow, IsCompleted = true, Priority = Priority.Low },
            new Todo { Title = "Pending + High", CreatedAt = DateTime.UtcNow, IsCompleted = false, Priority = Priority.High },
            new Todo { Title = "Pending + Low", CreatedAt = DateTime.UtcNow, IsCompleted = false, Priority = Priority.Low }
        );
        await ctx.SaveChangesAsync(Ct);
        var service = new TodoService(ctx);

        //when
        var items = await service.GetAllAsync(completed: true, priority: Priority.High, Ct);

        //then
        items.Should().HaveCount(1);
        items[0].Title.Should().Be("Done + High");
    }
}
