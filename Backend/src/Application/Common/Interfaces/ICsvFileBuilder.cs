using Amber.Application.TodoLists.Queries.ExportTodos;

namespace Amber.Application.Common.Interfaces;

public interface ICsvFileBuilder
{
    byte[] BuildTodoItemsFile(IEnumerable<TodoItemRecord> records);
}
