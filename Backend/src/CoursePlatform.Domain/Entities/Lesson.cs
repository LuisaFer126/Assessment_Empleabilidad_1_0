using System;

namespace CoursePlatform.Domain.Entities;

public class Lesson : BaseEntity
{
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Order { get; set; }
    
    // Navigation property
    public virtual Course? Course { get; set; }

    public void Update(string title, int order)
    {
        Title = title;
        Order = order;
        UpdatedAt = DateTime.UtcNow;
    }
}
