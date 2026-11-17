using System.Security.Claims;
using System.Text;
using api.Models;
using api.Services;
using api.Settings;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Xunit;

namespace api.Tests.Services;

public class TokenServiceTests
{
    private static JwtSettings CriarConfig(string? chave = null, int minutos = 60) => new()
    {
        Chave = chave ?? new string('k', 40),
        Issuer = "emissor-teste",
        Audience = "audiencia-teste",
        ExpiracaoEmMinutos = minutos
    };

    private static TokenService CriarServico(JwtSettings config) => new(Options.Create(config));

    private static Usuario CriarUsuario(PerfilUsuario perfil = PerfilUsuario.Admin) =>
        new() { Id = 7, Email = "ana@exemplo.com", Perfil = perfil };

    private static Task<TokenValidationResult> ValidarAsync(
        string token, JwtSettings config, string? chave = null, string? issuer = null, string? audience = null) =>
        new JsonWebTokenHandler().ValidateTokenAsync(token, new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = issuer ?? config.Issuer,
            ValidateAudience = true,
            ValidAudience = audience ?? config.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(chave ?? config.Chave)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        });

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("curta")]
    public void Construtor_ChaveAusenteOuCurta_LancaInvalidOperation(string chave)
    {
        Assert.Throws<InvalidOperationException>(() => CriarServico(CriarConfig(chave)));
    }

    [Fact]
    public void Construtor_Aceita32Bytes_E_Recusa31()
    {
        CriarServico(CriarConfig(new string('k', 32)));

        Assert.Throws<InvalidOperationException>(() => CriarServico(CriarConfig(new string('k', 31))));
    }

    [Fact]
    public async Task GerarToken_Valido_PassaNaValidacaoComIssuerAudienceEChave()
    {
        var config = CriarConfig();

        var token = CriarServico(config).GerarToken(CriarUsuario());

        Assert.True((await ValidarAsync(token.Token, config)).IsValid);
    }

    [Theory]
    [InlineData(PerfilUsuario.Admin, "Admin")]
    [InlineData(PerfilUsuario.Cliente, "Cliente")]
    public async Task GerarToken_TrazIdEmailEPerfilDoUsuario(PerfilUsuario perfil, string perfilEsperado)
    {
        var config = CriarConfig();

        var token = CriarServico(config).GerarToken(CriarUsuario(perfil));

        var identidade = (await ValidarAsync(token.Token, config)).ClaimsIdentity;
        Assert.Equal("7", identidade.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        Assert.Equal("ana@exemplo.com", identidade.FindFirst(ClaimTypes.Email)?.Value);
        Assert.Equal(perfilEsperado, identidade.FindFirst(ClaimTypes.Role)?.Value);
    }

    [Fact]
    public async Task GerarToken_ExpiraNoPrazoConfigurado()
    {
        var config = CriarConfig(minutos: 15);
        var antes = DateTime.UtcNow;

        var token = CriarServico(config).GerarToken(CriarUsuario());

        var depois = DateTime.UtcNow;
        Assert.InRange(token.ExpiraEm, antes.AddMinutes(15), depois.AddMinutes(15));

        var jwt = (JsonWebToken)(await ValidarAsync(token.Token, config)).SecurityToken;
        Assert.True(Math.Abs((jwt.ValidTo - token.ExpiraEm).TotalSeconds) < 2);
    }

    [Fact]
    public async Task Token_ValidadoComOutraChave_EhRejeitado()
    {
        var config = CriarConfig();
        var token = CriarServico(config).GerarToken(CriarUsuario());

        Assert.False((await ValidarAsync(token.Token, config, chave: new string('x', 40))).IsValid);
    }

    [Fact]
    public async Task Token_ComOutroIssuer_EhRejeitado()
    {
        var config = CriarConfig();
        var token = CriarServico(config).GerarToken(CriarUsuario());

        Assert.False((await ValidarAsync(token.Token, config, issuer: "outro-emissor")).IsValid);
    }

    [Fact]
    public async Task Token_ComOutraAudience_EhRejeitado()
    {
        var config = CriarConfig();
        var token = CriarServico(config).GerarToken(CriarUsuario());

        Assert.False((await ValidarAsync(token.Token, config, audience: "outra-audiencia")).IsValid);
    }
}