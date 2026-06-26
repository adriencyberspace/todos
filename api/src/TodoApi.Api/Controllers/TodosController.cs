using Microsoft.AspNetCore.Mvc;
using TodoApi.Api.Dtos;
using TodoApi.Api.Models;
using TodoApi.Api.Services;

namespace TodoApi.Api.Controllers;

[Route("todos")]
public class TodosController(ITodoService service) : ApiControllerBase
{
    [HttpGet]
    [ProducesResponseType<List<TodoResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] bool? completed,
        [FromQuery] Priority? priority,
        CancellationToken ct)
    {
        return Ok(await service.GetAllAsync(completed, priority, ct));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType<TodoResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await service.GetByIdAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    [ProducesResponseType<TodoResponse>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateTodoRequest request, CancellationToken ct)
    {
        var result = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType<TodoResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTodoRequest request, CancellationToken ct)
    {
        var result = await service.UpdateAsync(id, request, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPatch("{id:guid}/complete")]
    [ProducesResponseType<TodoResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Complete(Guid id, CancellationToken ct)
    {
        var result = await service.CompleteAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPatch("{id:guid}/uncomplete")]
    [ProducesResponseType<TodoResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Uncomplete(Guid id, CancellationToken ct)
    {
        var result = await service.UncompleteAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var deleted = await service.DeleteAsync(id, ct);
        return deleted ? NoContent() : NotFound();
    }
}
