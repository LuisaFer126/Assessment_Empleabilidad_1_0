using System;
using System.Threading.Tasks;
using CoursePlatform.Application.DTOs;
using CoursePlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoursePlatform.API.Controllers;

[Route("api/lessons")]
[ApiController]
[Authorize]
public class LessonsController : ControllerBase
{
    private readonly ILessonService _lessonService;

    public LessonsController(ILessonService lessonService)
    {
        _lessonService = lessonService;
    }

    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetByCourse(Guid courseId)
    {
        var result = await _lessonService.GetByCourseIdAsync(courseId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateLessonDto dto)
    {
        try
        {
            var result = await _lessonService.CreateAsync(dto);
            return Ok(result); // Should be CreatedAtAction...
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLessonDto dto)
    {
        try
        {
            await _lessonService.UpdateAsync(id, dto);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _lessonService.DeleteAsync(id);
        return NoContent();
    }

    [HttpPatch("{id}/reorder")]
    public async Task<IActionResult> Reorder(Guid id, [FromBody] int newOrder)
    {
        try
        {
            await _lessonService.UpdateOrderAsync(id, newOrder);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
