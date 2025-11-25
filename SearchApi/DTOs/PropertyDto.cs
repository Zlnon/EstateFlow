namespace EstateFlow.SearchApi.DTOs
{
    public class PropertyDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string FormattedPrice => $"${Price:N0}";
        public int Bedrooms { get; set; }
        public string Address { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public bool IsNew => DateTime.UtcNow - ListedAt < TimeSpan.FromDays(7);
        public DateTime ListedAt { get; set; }
    }
}
