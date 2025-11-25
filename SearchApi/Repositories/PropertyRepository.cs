using EstateFlow.SearchApi.Data;
using EstateFlow.SearchApi.Models;
using Microsoft.EntityFrameworkCore;

namespace EstateFlow.SearchApi.Repositories
{
    public class PropertyRepository : IPropertyRepository
    {
        private readonly AppDbContext _context;

        public PropertyRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Property>> SearchAsync(
            decimal? minPrice,
            decimal? maxPrice,
            int? minBedrooms
        )
        {
            var query = _context.Properties.AsQueryable();

            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);
            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);
            if (minBedrooms.HasValue)
                query = query.Where(p => p.Bedrooms >= minBedrooms.Value);

            return await query.ToListAsync();
        }

        public async Task<Property?> GetByIdAsync(int id)
        {
            return await _context.Properties.FindAsync(id);
        }
    }
}
