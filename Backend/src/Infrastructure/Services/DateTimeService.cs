using Amber.Application.Common.Interfaces;

namespace Amber.Infrastructure.Services;

public class DateTimeService : IDateTime
{
    public DateTime Now => DateTime.Now;
}
