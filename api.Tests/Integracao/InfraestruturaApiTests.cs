using System.Net;
using Xunit;

namespace api.Tests.Integracao
{
    [Collection("Api")]
    public class InfraestruturaApiTests : ApiTestBase
    {
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
    }
}