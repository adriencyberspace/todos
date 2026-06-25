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
