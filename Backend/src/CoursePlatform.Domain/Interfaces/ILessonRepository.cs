using System;
using System.Threading.Tasks;
using CoursePlatform.Domain.Entities;

namespace CoursePlatform.Domain.Interfaces;

public interface ILessonRepository : IRepository<Lesson>
{
    Task<IEnumerable<Lesson>> GetByCourseIdAsync(Guid courseId);
    Task<bool> ExistsOrderInCourseAsync(Guid courseId, int order);
}
