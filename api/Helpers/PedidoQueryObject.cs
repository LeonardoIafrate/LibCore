using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Models;

namespace api.Helpers
{
    public class PedidoQueryObject : PaginacaoQueryObject
    {
        public string? Nome { get; set; }
        public StatusPedido? Status { get; set; }
    }

    public class UsuarioQueryObject : PaginacaoQueryObject
    {
        public string? Nome { get; set; }
    }
}