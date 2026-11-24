namespace api.Models
{
    public class LivroImagem
    {
        public int Id { get; set; }
        public int LivroId { get; set; }
        public Livro Livro { get; set; } = null!;
        public string Arquivo { get; set; } = string.Empty;
        public int Ordem { get; set; }
    }
}
