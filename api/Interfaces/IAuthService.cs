using api.Dtos.Auth;

namespace api.Interfaces
{
    public interface IAuthService
    {
        Task<TokenDto> LoginAsync(LoginDto dto);

        /// <summary>Emite um token novo com o perfil atual do usuário no banco (ex.: após ser promovido a admin).</summary>
        Task<TokenDto> RenovarAsync(int usuarioId);
    }
}