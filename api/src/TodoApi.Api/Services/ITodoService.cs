using TodoApi.Api.Dtos;
using TodoApi.Api.Models;

namespace TodoApi.Api.Services;

public interface ITodoService
{
    Task<List<TodoResponse>> GetAllAsync(bool? completed, Priority? priority, CancellationToken ct);
    Task<TodoResponse?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<TodoResponse> CreateAsync(CreateTodoRequest request, CancellationToken ct);
    Task<TodoResponse?> UpdateAsync(Guid id, UpdateTodoRequest request, CancellationToken ct);
    Task<TodoResponse?> CompleteAsync(Guid id, CancellationToken ct);
    Task<TodoResponse?> UncompleteAsync(Guid id, CancellationToken ct);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct);
}
