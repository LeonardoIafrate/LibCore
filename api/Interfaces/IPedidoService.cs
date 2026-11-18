using api.Dtos.Pedido;
using api.Helpers;
using api.Models;

namespace api.Interfaces
{
    public interface IPedidoService
    {
        Task<PagedResult<PedidoDto>> GetAllAsync(PedidoQueryObject query);
        Task<PedidoDto> AtualizarStatusAsync(int id, StatusPedido status);
        Task<PedidoDto> GetByIdAsync(int id, int usuarioId, bool ehAdmin);
        Task<List<PedidoDto>> GetByUsuarioIdAsync(int usuarioId);
        Task<PedidoDto> CreatePedidoAsync(int usuarioId, CreatePedidoDto peditoDto);
        Task<PedidoDto> UpdateEnderecoPedidoAsync(int id, int usuarioId, AlterarEnderecoPedidoDto enderecoPedidoDto);
        Task<PedidoDto> CancelarPedidoAsync(int id, int usuarioId, bool ehAdmin);
    }
}