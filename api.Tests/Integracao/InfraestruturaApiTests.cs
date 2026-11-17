using System.Net;
using System.Net.Http;
using Xunit;

namespace api.Tests.Integracao
{
    [Collection("Api")]
    public class InfraestruturaApiTests : ApiTestBase
    {
        private const string OrigemPermitida = "http://localhost:5173";

        private static HttpRequestMessage Requisicao(HttpMethod metodo, string rota, string origem)
        {
            var requisicao = new HttpRequestMessage(metodo, rota);
            requisicao.Headers.Add("Origin", origem);
            return requisicao;
        }

        private static string? Cabecalho(HttpResponseMessage resposta, string nome) => 
            resposta.Headers.TryGetValues(nome, out var valores) ? valores.FirstOrDefault() : null;

        public InfraestruturaApiTests(ApiFixture fixture) : base(fixture)
        {
        }

        [Theory]
        [InlineData("/health/live")]
        [InlineData("/health/ready")]
        public async Task Health_SemToken_Retorna200(string rota)
        {
            var resposta = await Fixture.CriarCliente().GetAsync(rota);

            await AssertStatusAsync(HttpStatusCode.OK, resposta);
        }

        [Fact]
        public async Task Cors_OrigemPermitida_RecebeOCabecalho()
        {
            var resposta = await Fixture.CriarCliente().SendAsync(Requisicao(HttpMethod.Get, "api/livros", OrigemPermitida));

            await AssertStatusAsync(HttpStatusCode.OK, resposta);
            Assert.Equal(OrigemPermitida, Cabecalho(resposta, "Access-Control-Allow-Origin"));
        }

        [Fact]
        public async Task Cors_OrigemDesconhecida_NaoRecebeOCabecalho()
        {
            var resposta = await Fixture.CriarCliente().SendAsync(Requisicao(HttpMethod.Get, "/api/livros", "http://site-desconhecido.com"));

            Assert.Null(Cabecalho(resposta, "Access-Control-Allow-Origin"));
        }

        [Fact]
        public async Task Cors_Preflight_DeOrigemPermitida_Retorna204ComOsCabecalhos()
        {
            var requisicao = Requisicao(HttpMethod.Options, "/api/livros", OrigemPermitida);
            requisicao.Headers.Add("Access-Control-Request-Method", "POST");
            requisicao.Headers.Add("Access-Control-Request-Headers", "authorization,content-type");

            var resposta = await Fixture.CriarCliente().SendAsync(requisicao);

            await AssertStatusAsync(HttpStatusCode.NoContent, resposta);
            Assert.Equal(OrigemPermitida, Cabecalho(resposta, "Access-Control-Allow-Origin"));
            Assert.NotNull(Cabecalho(resposta, "Access-Control-Allow-Headers"));
        }

        [Fact]
        public async Task Cors_RespostaDeErro_TambemTemOCabecalho()
        {
            var resposta = await Fixture.CriarCliente().SendAsync(Requisicao(HttpMethod.Get, "/api/livros/999999", OrigemPermitida));

            await AssertStatusAsync(HttpStatusCode.NotFound, resposta);
            Assert.Equal(OrigemPermitida, Cabecalho(resposta, "Access-Control-Allow-Origin"));
        }
    }
}