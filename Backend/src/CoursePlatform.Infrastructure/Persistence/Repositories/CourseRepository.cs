using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using CoursePlatform.Domain.Entities;
using CoursePlatform.Domain.Enums;
using CoursePlatform.Domain.Interfaces;

namespace CoursePlatform.Infrastructure.Persistence.Repositories;

public class CourseRepository : Repository<Course>, ICourseRepository
{
    public CourseRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Course>> GetCoursesWithLessonsAsync()
    {
        return await _dbSet.Include(c => c.Lessons).ToListAsync();
    }

    public async Task<Course?> GetCourseWithLessonsAsync(Guid id)
    {
        return await _dbSet
            .Include(c => c.Lessons.OrderBy(l => l.Order))
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<Course>> GetByStatusAsync(CourseStatus status)
    {
        return await _dbSet
            .Where(c => c.Status == status)
            .ToListAsync();
    }
}
