using System.ComponentModel.DataAnnotations;
using TodoApi.Api.Models;

namespace TodoApi.Api.Dtos;

public record CreateTodoRequest(
    [Required][MaxLength(200)] string Title,
    [MaxLength(1000)] string? Description,
    DateTime? DueDate,
    Priority Priority = Priority.Medium
);

public record UpdateTodoRequest(
    [Required][MaxLength(200)] string Title,
    [MaxLength(1000)] string? Description,
    DateTime? DueDate,
    Priority Priority
);

public record TodoResponse(
    Guid Id,
    string Title,
    string? Description,
    bool IsCompleted,
    DateTime CreatedAt,
    DateTime? CompletedAt,
    DateTime? DueDate,
    Priority Priority
);

public static class TodoMappings
{
    public static TodoResponse ToResponse(this Todo t) =>
        new(t.Id, t.Title, t.Description, t.IsCompleted, t.CreatedAt, t.CompletedAt, t.DueDate, t.Priority);
}
