using Microsoft.EntityFrameworkCore;
using EstateFlow.SearchApi.Models;

namespace EstateFlow.SearchApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        
        public DbSet<Property> Properties { get; set; }
    }
}