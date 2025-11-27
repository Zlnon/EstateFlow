using System.Text;
using EstateFlow.SearchApi.Data;
using EstateFlow.SearchApi.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add Database Service
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions =>
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(10),
                errorNumbersToAdd: null
            )
    )
);

builder.Services.AddScoped<IPropertyRepository, PropertyRepository>();

var jwtKey = builder.Configuration["Jwt:Key"];
var key = Encoding.ASCII.GetBytes(jwtKey!);

builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false; // Allowed for localhost
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false, // We skip Issuer check for simplicity in dev
            ValidateAudience = false,
        };
    });

// Add Controllers
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors(policy =>
    policy
        .WithOrigins("https://estate-flow-sigma.vercel.app")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
);

app.UseAuthentication();
app.UseAuthorization();

// Configure the HTTP request pipelineapp.UseSwagger();

// Enable middleware to serve swagger-ui (HTML, JS, CSS, etc.)
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "EstateFlow API V1");
    c.RoutePrefix = string.Empty; // This makes Swagger load at the root URL (/)
});
app.UseHttpsRedirection();

// Map Controllers (this registers your PropertiesController and all other controllers)
app.MapControllers();

app.Run();
