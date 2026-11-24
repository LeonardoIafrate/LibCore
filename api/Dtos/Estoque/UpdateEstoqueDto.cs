using System.ComponentModel.DataAnnotations;

namespace api.Dtos.Estoque
{
    public class UpdateEstoqueDto
    {
        [Required(ErrorMessage = "Informe a quantidade em estoque.")]
        [Range(0, 1000000, ErrorMessage = "A quantidade de livros em estoque deve estar entre 0 e 1.000.000")]
        public int Quantidade { get; set; }
    }
}