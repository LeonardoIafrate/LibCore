using api.Helpers;
using api.Models;

namespace api.Interfaces
{
    public interface IUsuarioRepository
    {
        Task<PagedResult<Usuario>> GetAllAsync(UsuarioQueryObject query);
        Task<Usuario?> GetByIdAsync(int id);
        Task<Usuario?> GetByEmailAsync(string email);
        Task<Usuario?> GetByCpfAsync(string cpf);
        Task<Usuario> CreateAsync(Usuario usuarioModel);
        Task<Usuario?> UpdateAsync(int id, Usuario usuarioModel);
        Task<bool> UpdateSenhaAsync(int id, string senhaHash);
        Task AtualizarBloqueioAsync(int id, int TentativasFalhas, DateTime? BloqueadoAte);
        Task<Usuario?> AlterarUsuarioAdminAsync(int id);
        Task<Usuario?> DeleteAsync(int id);
        Task<Usuario?> DesativarAsync(int id);
        Task<bool> EstaAtivoAsync(int id);
        Task<bool> PossuiPedidosAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}