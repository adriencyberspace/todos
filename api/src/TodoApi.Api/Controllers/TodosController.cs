using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Api.Data;
using TodoApi.Api.Dtos;
using TodoApi.Api.Models;

namespace TodoApi.Api.Controllers;

[Route("todos")]
public class TodosController : ApiControllerBase
{
    private readonly TodoContext _context;

    public TodosController(TodoContext context)
    {
        _context = context;
    }

    [HttpGet]
    [ProducesResponseType<List<TodoResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] bool? completed,
        [FromQuery] Priority? priority,
        CancellationToken ct)
    {
        var query = _context.Todos.AsQueryable();
        if (completed.HasValue)
            query = query.Where(t => t.IsCompleted == completed.Value);
        if (priority.HasValue)
            query = query.Where(t => t.Priority == priority.Value);

        var todos = await query
            .Select(t => ToResponse(t))
            .ToListAsync(ct);

        return Ok(todos);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType<TodoResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var todo = await _context.Todos.FindAsync([id], ct);
        return todo is null ? NotFound() : Ok(ToResponse(todo));
    }

    [HttpPost]
    [ProducesResponseType<TodoResponse>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateTodoRequest request, CancellationToken ct)
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
        _context.Todos.Add(todo);
        await _context.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetById), new { id = todo.Id }, ToResponse(todo));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType<TodoResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTodoRequest request, CancellationToken ct)
    {
        var todo = await _context.Todos.FindAsync([id], ct);
        if (todo is null) return NotFound();

        todo.Title = request.Title;
        todo.Description = request.Description;
        todo.DueDate = request.DueDate;
        todo.Priority = request.Priority;
        await _context.SaveChangesAsync(ct);
        return Ok(ToResponse(todo));
    }

    [HttpPatch("{id:guid}/complete")]
    [ProducesResponseType<TodoResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Complete(Guid id, CancellationToken ct)
    {
        var todo = await _context.Todos.FindAsync([id], ct);
        if (todo is null) return NotFound();

        if (!todo.IsCompleted)
        {
            todo.IsCompleted = true;
            todo.CompletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(ct);
        }
        return Ok(ToResponse(todo));
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var todo = await _context.Todos.FindAsync([id], ct);
        if (todo is null) return NotFound();

        _context.Todos.Remove(todo);
        await _context.SaveChangesAsync(ct);
        return NoContent();
    }

    private static TodoResponse ToResponse(Todo t) =>
        new(t.Id, t.Title, t.Description, t.IsCompleted, t.CreatedAt, t.CompletedAt, t.DueDate, t.Priority);
}
