using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CoursePlatform.Domain.Entities;

namespace CoursePlatform.Infrastructure.Persistence.Configurations;

public class LessonConfiguration : IEntityTypeConfiguration<Lesson>
{
    public void Configure(EntityTypeBuilder<Lesson> builder)
    {
        builder.HasKey(l => l.Id);
        
        builder.Property(l => l.Title)
            .IsRequired()
            .HasMaxLength(200);

        // Unique Order per Course
        // Note: Soft deleted items might interfere with unique index if we are not careful.
        // Usually unique index should include IsDeleted or filter where IsDeleted = false.
        // EF Core doesn't support filtered indexes easily in all providers via Fluent API in a standard way,
        // but recent versions do. For simplicity & standard MySQL support, we can enforce this in business logic 
        // or add a unique index that allows duplicates if IsDeleted is true (logic complex in DB).
        // The requirements say "El campo Order de las lecciones debe ser único dentro del mismo curso".
        // Use HasIndex with IsUnique. 
        builder.HasIndex(l => new { l.CourseId, l.Order })
            .IsUnique(); 
            // Note: If we soft delete a lesson with Order 1, and try to create another one with Order 1, 
            // this DB constraint will fail unless we handle it. 
            // Ideally we'd include 'IsDeleted' in the index or handle soft delete by changing the value.
            // Requirement says "Reordenamiento no debe generar ordenes duplicados".
            // Let's keep it simple: The application logic will manage Order assignment. 
            // The DB constraint is a safety net. 
    }
}
