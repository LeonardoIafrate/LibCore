

using api.Data;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace api.HealthChecks
{
    public class BancoHealthCheck : IHealthCheck
    {
        private readonly AppDbContext _dbContext;

        public BancoHealthCheck(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _dbContext.Database.CanConnectAsync(cancellationToken)
                    ? HealthCheckResult.Healthy()
                    : HealthCheckResult.Unhealthy("Sem conexão com o banco.");
            }
            catch(Exception ex)
            {
                return HealthCheckResult.Unhealthy("Falha ao consultar o banco.", ex);
            }
        }

    }
}