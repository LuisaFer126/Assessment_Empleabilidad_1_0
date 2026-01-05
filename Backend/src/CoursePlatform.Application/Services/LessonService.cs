using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CoursePlatform.Application.DTOs;
using CoursePlatform.Application.Interfaces;
using CoursePlatform.Domain.Entities;
using CoursePlatform.Domain.Interfaces;

namespace CoursePlatform.Application.Services;

public class LessonService : ILessonService
{
    private readonly ILessonRepository _lessonRepository;

    public LessonService(ILessonRepository lessonRepository)
    {
        _lessonRepository = lessonRepository;
    }

    public async Task<IEnumerable<LessonDto>> GetByCourseIdAsync(Guid courseId)
    {
        var lessons = await _lessonRepository.GetByCourseIdAsync(courseId);
        return lessons.Select(l => new LessonDto(l.Id, l.CourseId, l.Title, l.Order));
    }

    public async Task<LessonDto> CreateAsync(CreateLessonDto dto)
    {
        // Rule: Order must be unique
        if (await _lessonRepository.ExistsOrderInCourseAsync(dto.CourseId, dto.Order))
        {
            throw new InvalidOperationException($"Lesson with order {dto.Order} already exists in course {dto.CourseId}");
        }

        var lesson = new Lesson
        {
            CourseId = dto.CourseId,
            Title = dto.Title,
            Order = dto.Order
        };

        await _lessonRepository.AddAsync(lesson);
        return new LessonDto(lesson.Id, lesson.CourseId, lesson.Title, lesson.Order);
    }

    public async Task UpdateAsync(Guid id, UpdateLessonDto dto)
    {
        var lesson = await _lessonRepository.GetByIdAsync(id);
        if (lesson == null) throw new KeyNotFoundException($"Lesson {id} not found");

        // If order changed, check uniqueness
        if (lesson.Order != dto.Order)
        {
             if (await _lessonRepository.ExistsOrderInCourseAsync(lesson.CourseId, dto.Order))
            {
                throw new InvalidOperationException($"Lesson with order {dto.Order} already exists in course {lesson.CourseId}");
            }
        }

        lesson.Update(dto.Title, dto.Order);
        await _lessonRepository.UpdateAsync(lesson);
    }

    public async Task DeleteAsync(Guid id)
    {
        await _lessonRepository.DeleteAsync(id);
    }

    public async Task UpdateOrderAsync(Guid id, int newOrder)
    {
        // Basic implementation: Just swap? Or Shift?
        // Requirement: "Reordenar lecciones (subir/bajar posición)"
        // "El reordenamiento de lecciones no debe generar órdenes duplicados."
        
        // Strategy:
        // 1. Get the lesson.
        // 2. Check if another lesson exists at newOrder.
        // 3. If so, swap them? Or shift everything?
        // Swapping is easiest for "subir/bajar" (move up/down).
        
        var lesson = await _lessonRepository.GetByIdAsync(id);
        if (lesson == null) throw new KeyNotFoundException($"Lesson {id} not found");
        
        if (lesson.Order == newOrder) return; // No change

        if (newOrder <= 0)
        {
            throw new InvalidOperationException("Order must be a positive integer.");
        }

        var otherLesson = (await _lessonRepository.GetByCourseIdAsync(lesson.CourseId))
                            .FirstOrDefault(l => l.Order == newOrder);

        var now = DateTime.UtcNow;

        if (otherLesson != null)
        {
            // Swap orders without ever producing duplicates.
            var oldOrder = lesson.Order;
            const int tempOrder = int.MinValue;

            otherLesson.Order = tempOrder;
            otherLesson.UpdatedAt = now;
            await _lessonRepository.UpdateAsync(otherLesson);

            lesson.Order = newOrder;
            lesson.UpdatedAt = now;
            await _lessonRepository.UpdateAsync(lesson);

            otherLesson.Order = oldOrder;
            otherLesson.UpdatedAt = now;
            await _lessonRepository.UpdateAsync(otherLesson);
        }
        else
        {
            // Just move to empty slot
            // But constraint says unique. If there's a gap, it is fine-ish.
            lesson.Order = newOrder;
            lesson.UpdatedAt = now;
            await _lessonRepository.UpdateAsync(lesson);
        }
    }
}
