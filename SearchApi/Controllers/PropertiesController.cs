using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EstateFlow.SearchApi.Data;
using EstateFlow.SearchApi.Models;

namespace EstateFlow.SearchApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PropertiesController : ControllerBase
    {
        private readonly AppDbContext _context;

        // 1. Dependency Injection: Asking for the Database
        public PropertiesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/properties?minPrice=100000&minBedrooms=2
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Property>>> GetProperties(
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] int? minBedrooms)
        {
            // Start with "All Properties" SIMILER TO FIRESTORE
            var query = _context.Properties.AsQueryable();

            // 2. Apply Filters dynamically using LINQ
            if (minPrice.HasValue)
            {
                query = query.Where(p => p.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= maxPrice.Value);
            }

            if (minBedrooms.HasValue)
            {
                query = query.Where(p => p.Bedrooms >= minBedrooms.Value);
            }

            // 3. Execute the query (This runs the SELECT SQL)
            return await query.ToListAsync();
        }

        // POST: api/properties
        // (Note: In our final app, Laravel will do this. We are adding it here TEMPORARILY just to create test data)
        [HttpPost]
        public async Task<ActionResult<Property>> CreateProperty(Property property)
        {
            _context.Properties.Add(property);
            await _context.SaveChangesAsync();
            return Ok(property);
        }
    }
}