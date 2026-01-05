using System.Threading.Tasks;
using CoursePlatform.Domain.Entities;
using CoursePlatform.Domain.Enums;

namespace CoursePlatform.Domain.Interfaces;

public interface ICourseRepository : IRepository<Course>
{
    Task<IEnumerable<Course>> GetCoursesWithLessonsAsync();
    Task<Course?> GetCourseWithLessonsAsync(Guid id);
    Task<IEnumerable<Course>> GetByStatusAsync(CourseStatus status);
}
