using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using CoursePlatform.Domain.Entities;
using CoursePlatform.Domain.Interfaces;

namespace CoursePlatform.Infrastructure.Persistence.Repositories;

public class LessonRepository : Repository<Lesson>, ILessonRepository
{
    public LessonRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Lesson>> GetByCourseIdAsync(Guid courseId)
    {
        return await _dbSet
            .Where(l => l.CourseId == courseId)
            .OrderBy(l => l.Order)
            .ToListAsync();
    }

    public async Task<bool> ExistsOrderInCourseAsync(Guid courseId, int order)
    {
        return await _dbSet
            .AnyAsync(l => l.CourseId == courseId && l.Order == order && !l.IsDeleted);
    }
}
