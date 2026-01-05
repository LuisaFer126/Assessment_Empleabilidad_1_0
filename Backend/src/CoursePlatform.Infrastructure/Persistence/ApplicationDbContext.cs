using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using CoursePlatform.Domain.Entities;
using System.Reflection;

namespace CoursePlatform.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Course> Courses { get; set; }
    public DbSet<Lesson> Lessons { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Apply all configurations from the current assembly
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Global query filter for Soft Delete
        builder.Entity<Course>().HasQueryFilter(c => !c.IsDeleted);
        builder.Entity<Lesson>().HasQueryFilter(l => !l.IsDeleted);
    }
}
