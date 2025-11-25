using EstateFlow.SearchApi.Data;
using EstateFlow.SearchApi.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add Database Service
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions =>
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5, // Try 5 times
                maxRetryDelay: TimeSpan.FromSeconds(10), // Wait 10s between tries
                errorNumbersToAdd: null
            )
    )
);

builder.Services.AddScoped<IPropertyRepository, PropertyRepository>();

// Add Controllers
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure CORS (Cross-Origin Resource Sharing)
// Allows your frontend (e.g., React app) to call this API
// TODO:In production, change AllowAnyOrigin() to specific domain like "http://localhost:3000"
app.UseCors(policy => policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Map Controllers (this registers your PropertiesController and all other controllers)
app.MapControllers();

app.Run();
