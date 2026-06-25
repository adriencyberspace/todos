namespace TodoApi.Api.Models;

public class Todo
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public Priority Priority { get; set; }
}

public enum Priority { Low = 0, Medium = 1, High = 2 }
