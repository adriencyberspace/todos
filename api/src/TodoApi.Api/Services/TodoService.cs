using Microsoft.EntityFrameworkCore;
using TodoApi.Api.Data;
using TodoApi.Api.Dtos;
using TodoApi.Api.Models;

namespace TodoApi.Api.Services;

public class TodoService(TodoContext context) : ITodoService
{
    public async Task<List<TodoResponse>> GetAllAsync(bool? completed, Priority? priority, CancellationToken ct)
    {
        var query = context.Todos.AsQueryable();
        if (completed.HasValue)
            query = query.Where(t => t.IsCompleted == completed.Value);
        if (priority.HasValue)
            query = query.Where(t => t.Priority == priority.Value);

        var todos = await query.ToListAsync(ct);
        return todos.ConvertAll(t => t.ToResponse());
    }

    public async Task<TodoResponse?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var todo = await context.Todos.FindAsync([id], ct);
        return todo?.ToResponse();
    }

    public async Task<TodoResponse> CreateAsync(CreateTodoRequest request, CancellationToken ct)
    {
        var todo = new Todo
        {
            Title = request.Title,
            Description = request.Description,
            DueDate = request.DueDate,
            Priority = request.Priority,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow,
        };
        context.Todos.Add(todo);
        await context.SaveChangesAsync(ct);
        return todo.ToResponse();
    }

    public async Task<TodoResponse?> UpdateAsync(Guid id, UpdateTodoRequest request, CancellationToken ct)
    {
        var todo = await context.Todos.FindAsync([id], ct);
        if (todo is null) return null;

        todo.Title = request.Title;
        todo.Description = request.Description;
        todo.DueDate = request.DueDate;
        todo.Priority = request.Priority;
        await context.SaveChangesAsync(ct);
        return todo.ToResponse();
    }

    public async Task<TodoResponse?> CompleteAsync(Guid id, CancellationToken ct)
    {
        var todo = await context.Todos.FindAsync([id], ct);
        if (todo is null) return null;

        if (!todo.IsCompleted)
        {
            todo.IsCompleted = true;
            todo.CompletedAt = DateTime.UtcNow;
            await context.SaveChangesAsync(ct);
        }
        return todo.ToResponse();
    }

    public async Task<TodoResponse?> UncompleteAsync(Guid id, CancellationToken ct)
    {
        var todo = await context.Todos.FindAsync([id], ct);
        if (todo is null) return null;

        if (todo.IsCompleted)
        {
            todo.IsCompleted = false;
            todo.CompletedAt = null;
            await context.SaveChangesAsync(ct);
        }
        return todo.ToResponse();
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var todo = await context.Todos.FindAsync([id], ct);
        if (todo is null) return false;

        context.Todos.Remove(todo);
        await context.SaveChangesAsync(ct);
        return true;
    }
}
