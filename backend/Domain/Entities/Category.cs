namespace MarketPlace.Domain.Entities
{
    public class Category
    {
        public int CategoryId  { get; set; }   
        public string Name { get; set; } = string.Empty;
        public int? ParentId { get; set; }   
        public string? Description { get; set; }

        public Category? Parent { get; set; }
        public ICollection<Category> Children { get; set; } = new List<Category>();
    }
}
