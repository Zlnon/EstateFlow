using EstateFlow.SearchApi.DTOs;
using EstateFlow.SearchApi.Models;
using EstateFlow.SearchApi.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EstateFlow.SearchApi.Controllers
{
    /// <summary>
    /// Controller for handling property-related API requests.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class PropertiesController : ControllerBase
    {
        private readonly IPropertyRepository _repository;

        public PropertiesController(IPropertyRepository repository)
        {
            _repository = repository;
        }

        // GET: api/properties?minPrice=100000&minBedrooms=2
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<PropertyDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<PropertyDto>>> GetProperties(
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] int? minBedrooms
        )
        {
            var properties = await _repository.SearchAsync(minPrice, maxPrice, minBedrooms);

            // Map Property models to PropertyDto
            var propertyDtos = properties.Select(MapToDto);

            return Ok(propertyDtos);
        }

        /// <summary>
        /// Gets a single property by its ID.
        /// </summary>
        /// <param name="id">The unique identifier of the property</param>
        // GET: api/properties/5
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(PropertyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PropertyDto>> GetProperty(int id)
        {
            var property = await _repository.GetByIdAsync(id);

            if (property == null)
            {
                return NotFound();
            }

            return Ok(MapToDto(property));
        }

        [HttpPost]
        [ProducesResponseType(typeof(Property), StatusCodes.Status201Created)]
        public async Task<ActionResult<Property>> CreateProperty(Property property)
        {
            // Note: This requires adding a Create method to the repository
            // For now, keeping direct DbContext access for POST (temporary endpoint)
            // In production, Laravel will handle property creation
            return BadRequest("Property creation should be handled by Laravel API");
        }

        /// <summary>
        /// Maps a Property entity to a PropertyDto.
        /// </summary>
        /// <param name="property">The property entity to map</param>
        /// <returns>A PropertyDto with formatted data</returns>
        private static PropertyDto MapToDto(Property property)
        {
            return new PropertyDto
            {
                Id = property.Id,
                Title = property.Title,
                Price = property.Price,
                Bedrooms = property.Bedrooms,
                Address = property.Address,
                ImageUrl = property.ImageUrl,
                ListedAt = property.ListedAt,
            };
        }
    }
}
