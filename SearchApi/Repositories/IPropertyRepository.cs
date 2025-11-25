using EstateFlow.SearchApi.Models;

namespace EstateFlow.SearchApi.Repositories
{
    public interface IPropertyRepository
    {
        Task<IEnumerable<Property>> SearchAsync(
            decimal? minPrice,
            decimal? maxPrice,
            int? minBedrooms
        );
        Task<Property?> GetByIdAsync(int id);
    }
}
