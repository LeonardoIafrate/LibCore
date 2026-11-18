using Microsoft.EntityFrameworkCore;

namespace api.Helpers
{
    public static class PaginacaoExtensions
    {
        public static async Task<PagedResult<T>> ToPagedResultAsync<T>(this IQueryable<T> consulta, int pagina, int tamanhoPagina)
        {
            var total = await consulta.CountAsync();

            var itens = await consulta.Skip((pagina - 1) * tamanhoPagina).Take(tamanhoPagina).ToListAsync();

            return new PagedResult<T>(itens, total, pagina, tamanhoPagina);
        }
    }
}