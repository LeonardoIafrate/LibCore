using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Data;
using api.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Xunit;

namespace api.Tests.Services
{
    public class BancoHealthCheckTests
    {
        [Fact]
        public async Task BancoInacessivel_ReportaUnhealthy()
        {
            var opcoes = new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlServer("Server=127.0.0.1,1;Database=x;User Id=sa;Password=x;TrustServerCertificate=True;Connect Timeout=2")
                .Options;

            await using var contexto = new AppDbContext(opcoes);

            var resultado = await new BancoHealthCheck(contexto).CheckHealthAsync(new HealthCheckContext());

            Assert.Equal(HealthStatus.Unhealthy, resultado.Status);
        }
    }
}