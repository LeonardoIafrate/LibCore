using api.Data;
using api.Exceptions;
using api.Models;
using api.Repository;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace api.Tests.Banco
{
    [Collection("SqlServer")]
    public class DbInitializerTests
    {
        private const string Email = "admin@exemplo.com";
        private const string Cpf = "52998224725";
        private const string Senha = "Admin12345";

        private readonly SqlServerFixture _fixture;
        
        public DbInitializerTests(SqlServerFixture fixture) => _fixture = fixture;

        private static IConfiguration Config(Dictionary<string, string?>? sobrescritas = null)
        {
            var valores = new Dictionary<string, string?>
            {
              ["BootstrapAdmin:Name"] = "Administrador", 
              ["BootstrapAdmin:Email"] = "  Admin@Exemplo.com ",
              ["BootstrapAdmin:Password"] = Senha, 
              ["BootstrapAdmin:Cpf"] = "529.982.247-25"
            };

            if (sobrescritas != null)
            {
                foreach(var(chave, valor) in sobrescritas)
                    valores[chave] = valor;
            }

            return new ConfigurationBuilder().AddInMemoryCollection(valores).Build();
        }

        private static DbInitializer Criar(AppDbContext contexto, IConfiguration? config = null) =>
            new(contexto, new UsuarioRepository(contexto), new EnderecoRepository(contexto),
                new PasswordHasher<Usuario>(), config ?? Config());

        private static async Task SalvarAsync(AppDbContext contexto, Usuario usuario)
        {
            contexto.Set<Usuario>().Add(usuario);
            await contexto.SaveChangesAsync();
        }

        [Fact]
        public async Task BancoVazio_PreservaAcapitalizacaoDoNome()
        {
            await using var contexto = await _fixture.CriarBancoLimpoAsync();

            await Criar(contexto).InitializeAsync();

            await using var conferencia = _fixture.NovoContextoDoMesmoBanco(contexto);
            Assert.Equal("Administrador", (await conferencia.Set<Usuario>().SingleAsync()).Nome);
        }

        [Fact]
        public async Task ChamaDuasVezes_NaoDuplicaOAdminNemOEndereco()
        {
            await using var contexto = await _fixture.CriarBancoLimpoAsync();

            await Criar(contexto).InitializeAsync();

            await using var conferencia = _fixture.NovoContextoDoMesmoBanco(contexto);
            Assert.True((await conferencia.Set<Endereco>().SingleAsync()).Principal);
        }

        [Fact]
        public async Task AdminExistenteSemEndereco_GanhaUmEnderecoPrincipal()
        {
            await using var contexto = await _fixture.CriarBancoLimpoAsync();
            var admin = DadosDeTeste.NovoUsuario(Email, Cpf);
            admin.Perfil = PerfilUsuario.Admin;
            await SalvarAsync(contexto, admin);

            await using var outro = _fixture.NovoContextoDoMesmoBanco(contexto);
            await Criar(outro).InitializeAsync();

            await using var conferencia = _fixture.NovoContextoDoMesmoBanco(contexto);
            var endereco = await conferencia.Set<Endereco>().SingleAsync();
            Assert.Equal(admin.Id, endereco.UsuarioId);
            Assert.True(endereco.Principal);
        }

        [Fact]
        public async Task EmailDeUmClienteComum_LancaConflict()
        {
            await using var contexto = await _fixture.CriarBancoLimpoAsync();
            await SalvarAsync(contexto, DadosDeTeste.NovoUsuario(Email, "11144477735"));

            await using var outro = _fixture.NovoContextoDoMesmoBanco(contexto);

            await Assert.ThrowsAsync<ConflictException>(() => Criar(outro).InitializeAsync());
        }

        [Fact]
        public async Task AdminInativo_LancaConflict()
        {
            await using var contexto = await _fixture.CriarBancoLimpoAsync();
            var admin = DadosDeTeste.NovoUsuario(Email, Cpf);
            admin.Perfil = PerfilUsuario.Admin;
            admin.Ativo = false;
            await SalvarAsync(contexto, admin);

            await using var outro = _fixture.NovoContextoDoMesmoBanco(contexto);

            await Assert.ThrowsAsync<ConflictException>(() => Criar(outro).InitializeAsync());
        }

        [Fact]
        public async Task CpfJaUsadoPorOutroUsuario_LancaConflictENaoCriaOAdmin()
        {
            await using var contexto = await _fixture.CriarBancoLimpoAsync();
            await SalvarAsync(contexto, DadosDeTeste.NovoUsuario("outro@exemplo.com", Cpf));

            await using var outro = _fixture.NovoContextoDoMesmoBanco(contexto);
            await Assert.ThrowsAsync<ConflictException>(() => Criar(outro).InitializeAsync());

            await using var conferencia = _fixture.NovoContextoDoMesmoBanco(contexto);
            Assert.Equal(1, await conferencia.Set<Usuario>().CountAsync());
        }

        [Theory]
        [InlineData("BootstrapAdmin:Name")]
        [InlineData("BootstrapAdmin:Email")]
        [InlineData("BootstrapAdmin:Password")]
        [InlineData("BootstrapAdmin:Cpf")]
        public async Task ConfiguracaoObrigatoriaAusente_LancaInvalidOperation(string chave)
        {
            await using var contexto = await _fixture.CriarBancoLimpoAsync();
            var config = Config(new Dictionary<string, string?> { [chave] = null });

            await Assert.ThrowsAsync<InvalidOperationException>(() => Criar(contexto, config).InitializeAsync());
        }

        [Fact]
        public async Task CpfInvalido_LancaInvalidOperationENaoCriaNada()
        {
            await using var contexto = await _fixture.CriarBancoLimpoAsync();
            var config = Config(new Dictionary<string, string?> { ["BootstrapAdmin:Cpf"] = "111.111.111-11" });

            await Assert.ThrowsAsync<InvalidOperationException>(() => Criar(contexto, config).InitializeAsync());

            await using var conferencia = _fixture.NovoContextoDoMesmoBanco(contexto);
            Assert.Equal(0, await conferencia.Set<Usuario>().CountAsync());
        }
    }
}