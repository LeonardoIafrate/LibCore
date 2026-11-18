using System.ComponentModel.DataAnnotations;

namespace api.Helpers
{
    public class PaginacaoQueryObject
    {
        [Range(1, int.MaxValue, ErrorMessage = "A página deve ser maior ou igual a 1.")]
        public int Pagina { get; set; } = 1;

        [Range(1, 50, ErrorMessage = "O tamanho da página deve estar entre 1 e 50.")]
        public int TamanhoPagina { get; set; } = 10;
    }
}