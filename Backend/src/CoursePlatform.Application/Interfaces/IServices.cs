using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CoursePlatform.Application.DTOs;
using CoursePlatform.Domain.Enums;

namespace CoursePlatform.Application.Interfaces;

public interface ICourseService
{
    Task<PagedResult<CourseDto>> GetAllAsync(string? search, CourseStatus? status, int page, int pageSize);
    Task<CourseDetailDto?> GetByIdAsync(Guid id);
    Task<CourseDto> CreateAsync(CreateCourseDto dto);
    Task UpdateAsync(Guid id, UpdateCourseDto dto);
    Task DeleteAsync(Guid id);
    Task PublishAsync(Guid id);
    Task UnpublishAsync(Guid id);
    Task<CourseSummaryDto?> GetSummaryAsync(Guid id);
}

public interface ILessonService
{
    Task<IEnumerable<LessonDto>> GetByCourseIdAsync(Guid courseId);
    Task<LessonDto> CreateAsync(CreateLessonDto dto);
    Task UpdateAsync(Guid id, UpdateLessonDto dto);
    Task DeleteAsync(Guid id);
    // Reorder logic could be complex. Let's say we pass a list of ids in order, or just swap. 
    // Requirement: "Reordenar lecciones (subir/bajar posición)".
    // Simplest approach: UpdateOrder(id, newOrder) and shift others. Or Swap(id1, id2).
    // Let's implement UpdateOrder.
    Task UpdateOrderAsync(Guid id, int newOrder); 
}

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
}
