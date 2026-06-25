using AwesomeAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Api.Controllers;
using TodoApi.Api.Data;
using TodoApi.Api.Dtos;
using TodoApi.Api.Models;

namespace TodoApi.UnitTests.Controllers;

public class TodosControllerTests
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
        var controller = new TodosController(ctx);
        var request = new CreateTodoRequest("Buy milk", null, null, Priority.Medium);

        //when
        var result = await controller.Create(request, CancellationToken.None);

        //then
        var created = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var response = created.Value.Should().BeOfType<TodoResponse>().Subject;
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
        await ctx.SaveChangesAsync();
        var controller = new TodosController(ctx);

        //when
        var result = await controller.Complete(todo.Id, CancellationToken.None);

        //then
        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = ok.Value.Should().BeOfType<TodoResponse>().Subject;
        response.IsCompleted.Should().BeTrue();
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
        await ctx.SaveChangesAsync();
        var controller = new TodosController(ctx);

        //when
        var result = await controller.Complete(todo.Id, CancellationToken.None);

        //then
        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = ok.Value.Should().BeOfType<TodoResponse>().Subject;
        response.CompletedAt.Should().Be(originalCompletedAt);
    }

    [Fact]
    public async Task GetAll_FilterByCompleted_ReturnsOnlyMatchingTodos()
    {
        //given
        using var ctx = CreateContext();
        ctx.Todos.AddRange(
            new Todo { Title = "Done", CreatedAt = DateTime.UtcNow, IsCompleted = true },
            new Todo { Title = "Pending", CreatedAt = DateTime.UtcNow, IsCompleted = false }
        );
        await ctx.SaveChangesAsync();
        var controller = new TodosController(ctx);

        //when
        var result = await controller.GetAll(completed: true, priority: null, CancellationToken.None);

        //then
        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var items = ok.Value.Should().BeOfType<List<TodoResponse>>().Subject;
        items.Should().HaveCount(1);
        items[0].Title.Should().Be("Done");
    }

    [Fact]
    public async Task GetAll_FilterByPriority_ReturnsOnlyMatchingTodos()
    {
        //given
        using var ctx = CreateContext();
        ctx.Todos.AddRange(
            new Todo { Title = "High priority", CreatedAt = DateTime.UtcNow, Priority = Priority.High },
            new Todo { Title = "Low priority", CreatedAt = DateTime.UtcNow, Priority = Priority.Low }
        );
        await ctx.SaveChangesAsync();
        var controller = new TodosController(ctx);

        //when
        var result = await controller.GetAll(completed: null, priority: Priority.High, CancellationToken.None);

        //then
        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var items = ok.Value.Should().BeOfType<List<TodoResponse>>().Subject;
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
        await ctx.SaveChangesAsync();
        var controller = new TodosController(ctx);

        //when
        var deleteResult = await controller.Delete(todo.Id, CancellationToken.None);

        //then
        deleteResult.Should().BeOfType<NoContentResult>();
        var getResult = await controller.GetById(todo.Id, CancellationToken.None);
        getResult.Should().BeOfType<NotFoundResult>();
    }
}
