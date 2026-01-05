using System.Text;
using CoursePlatform.Application.Interfaces;
using CoursePlatform.Application.Services;
using CoursePlatform.Domain.Interfaces;
using CoursePlatform.Infrastructure.Identity;
using CoursePlatform.Infrastructure.Persistence;
using CoursePlatform.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// 1. Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    // Auto-detect version to avoid mismatches across machines/environments.
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// 2. Identity
builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// 3. Authentication (JWT)
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"] ?? "SuperSecretKeyThatShouldBeLongEnough123456789";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "CoursePlatform",
        ValidAudience = jwtSettings["Audience"] ?? "CoursePlatformUser",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

// 4. Application Services (DI)
builder.Services.AddScoped<ICourseRepository, CourseRepository>();
builder.Services.AddScoped<ILessonRepository, LessonRepository>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<ILessonService, LessonService>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        b => b.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
// app.UseSwagger();
    // app.UseSwaggerUI();
}

// In dev, HTTPS redirection can break local frontends (redirect to a cert the browser doesn't trust).
// Keep it for non-development environments.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

// Quick sanity check for the frontend / Postman.
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

app.MapControllers();

// Seed Database (Basic)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try 
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.Migrate();

        // Seed User
        var userManager = services.GetRequiredService<UserManager<IdentityUser>>();
        if (!userManager.Users.Any())
        {
            var user = new IdentityUser { UserName = "admin@test.com", Email = "admin@test.com" };
            var createResult = userManager.CreateAsync(user, "Admin123!").GetAwaiter().GetResult();
            if (!createResult.Succeeded)
            {
                var errors = string.Join(" | ", createResult.Errors.Select(e => e.Description));
                Console.WriteLine($"Seed user creation failed: {errors}");
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine("An error occurred seeding the DB:");
        Console.WriteLine(ex);
    }
}

app.Run();
