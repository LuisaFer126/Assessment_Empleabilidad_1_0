using System;
using CoursePlatform.Domain.Enums;

namespace CoursePlatform.Application.DTOs;

public record CourseDto(Guid Id, string Title, CourseStatus Status, DateTime UpdatedAt);
public record CourseDetailDto(Guid Id, string Title, CourseStatus Status, DateTime CreatedAt, DateTime UpdatedAt, IEnumerable<LessonDto> Lessons);
public record CreateCourseDto(string Title);
public record UpdateCourseDto(string Title);

public record LessonDto(Guid Id, Guid CourseId, string Title, int Order);
public record CreateLessonDto(Guid CourseId, string Title, int Order);
public record UpdateLessonDto(string Title, int Order);

public record CourseSummaryDto(Guid Id, string Title, int TotalLessons, DateTime UpdatedAt);

public record LoginDto(string Email, string Password);
public record RegisterDto(string Email, string Password);
public record AuthResponseDto(string Token, string Email);
