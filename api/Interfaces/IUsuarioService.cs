using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Dtos.Usuario;
using api.Helpers;

namespace api.Interfaces
{
    public interface IUsuarioService
    {
        Task<PagedResult<UsuarioDto>> GetAllAsync(UsuarioQueryObject query);
        Task<UsuarioDto> GetByIdAsync(int id);
        Task<UsuarioDto> GetByEmailAsync(string email);
        Task<UsuarioDto> GetByCpfAsync(string cpf);
        Task<UsuarioDto> CreateAsync(CreateUsuarioDto dto);
        Task<UsuarioDto> CreateAdminAsync(CreateUsuarioDto dto);
        Task<UsuarioDto> UpdateAsync(int id, UpdateUsuarioDto dto);
        Task<UsuarioDto> AlterarAdminAsync(int id);
        Task AlterarSenhaAsync(int id, AlterarSenhaDto alterarSenhaDto);
        Task DeleteAsync(int id);
        Task DesativarAsync(int id);
    }
}