using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EstateFlow.SearchApi.Models
{
    public class Property
    {
        [Key] // Primary Key
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")] // Money format
        public decimal Price { get; set; }

        public int Bedrooms { get; set; }
        
        public string Address { get; set; } = string.Empty;

        public string? ImageUrl { get; set; } // Nullable (?) because image is optional

        public DateTime ListedAt { get; set; } = DateTime.UtcNow;
    }
}