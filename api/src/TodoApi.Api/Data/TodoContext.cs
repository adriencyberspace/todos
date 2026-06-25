using Microsoft.EntityFrameworkCore;
using TodoApi.Api.Models;

namespace TodoApi.Api.Data;

public class TodoContext : DbContext
{
    public TodoContext(DbContextOptions<TodoContext> options) : base(options) { }

    public DbSet<Todo> Todos => Set<Todo>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Todo>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.Id).ValueGeneratedOnAdd();
            e.Property(t => t.Title).IsRequired().HasMaxLength(200);
            e.Property(t => t.Description).HasMaxLength(1000);
        });
    }
}
