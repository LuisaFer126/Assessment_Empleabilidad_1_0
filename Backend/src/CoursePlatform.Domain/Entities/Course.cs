using System;
using System.Collections.Generic;
using CoursePlatform.Domain.Enums;

namespace CoursePlatform.Domain.Entities;

public class Course : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public CourseStatus Status { get; set; } = CourseStatus.Draft;
    
    // Navigation property
    public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();

    public void Update(string title)
    {
        Title = title;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Publish()
    {
        // Rule: A course can only be published if it has at least one active lesson.
        // This validation might be better placed in the Service/Domain Service to ensure complete invariant check, 
        // but can also be here if we load lessons. 
        // For now, we'll set the status. The service will enforce the rule.
        Status = CourseStatus.Published;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Unpublish()
    {
        Status = CourseStatus.Draft;
        UpdatedAt = DateTime.UtcNow;
    }
}
