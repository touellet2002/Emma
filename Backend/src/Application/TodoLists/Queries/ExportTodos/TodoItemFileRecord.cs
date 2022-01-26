using Amber.Application.Common.Mappings;
using Amber.Domain.Entities;

namespace Amber.Application.TodoLists.Queries.ExportTodos;

public class TodoItemRecord : IMapFrom<TodoItem>
{
    public string? Title { get; set; }

    public bool Done { get; set; }
}
