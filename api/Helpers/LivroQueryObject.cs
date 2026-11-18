using System.ComponentModel.DataAnnotations;

namespace api.Helpers
{
    public class LivroQueryObject : PaginacaoQueryObject, IValidatableObject
    {
        public LivroQueryObject()
        {
            TamanhoPagina = 20;
        }

        public string? Nome { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Informe uma editora válida.")]
        public int? EditoraId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Informe um(a) autor válido(a)")]
        public int? AutorId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Informe uma categoria válida.")]
        public int? CategoriaId { get; set; }

        [Range(0, 10000, ErrorMessage = "O preço mínimo deve estar entre 0 e 10.000.")]
        public decimal? PrecoMin { get; set; }

        [Range(0, 10000, ErrorMessage = "O preço máximo deve estar entre 0 e 10.000.")]
        public decimal? PrecoMax { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (PrecoMin.HasValue && PrecoMax.HasValue && PrecoMin > PrecoMax)
            {
                yield return new ValidationResult(
                    "O preço mínimo não pode ser maior que o preço máximo.",
                    new[] { nameof(PrecoMin), nameof(PrecoMax) });
            }
        }
    }
}