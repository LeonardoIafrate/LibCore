using api.Helpers;
using api.Models;

namespace api.Interfaces
{
    public interface IPedidoRepository
    {
        Task<PagedResult<Pedido>> GetAllAsync(PedidoQueryObject query);
        Task<Pedido?> GetByIdAsync(int id);
        Task<List<Pedido>> GetByIdUsuarioAsync(int usuarioId);
        Task<Pedido> CreatePedidoAsync(Pedido pedidoModel);
        Task<Pedido?> UpdateEnderecoPedidoAsync(int id, EnderecoEntrega novoEndereco);
        Task<Pedido?> AtualizarStatusAsync(int id, StatusPedido status);
        Task<Pedido?> CancelarPedidoAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}