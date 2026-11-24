using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;

namespace api.Data
{
    /// <summary>
    /// Dá uma capa inicial aos livros do catálogo de exemplo. As imagens ficam em SeedImagens/{isbn}.png
    /// e são copiadas para a pasta de uploads como inicial-{isbn}-{hash}.png.
    /// Atua em livros sem capa e em livros que ainda usam uma capa inicial (para refletir imagens trocadas);
    /// capas enviadas pelo admin nunca são alteradas.
    /// </summary>
    public static class CapasIniciais
    {
        private const string Prefixo = "inicial-";

        public static async Task AplicarAsync(
            AppDbContext contexto,
            string raizDoConteudo,
            ILogger logger,
            CancellationToken cancelamento = default)
        {
            var origem = Path.Combine(AppContext.BaseDirectory, "SeedImagens");
            if (!Directory.Exists(origem))
                return;

            var destino = Path.Combine(raizDoConteudo, "wwwroot", "uploads", "livros");
            Directory.CreateDirectory(destino);

            var candidatos = await contexto.Livro
                .Where(l => l.ImagemArquivo == null || l.ImagemArquivo.StartsWith(Prefixo))
                .ToListAsync(cancelamento);

            var aplicadas = 0;

            foreach (var livro in candidatos)
            {
                var arquivoOrigem = Path.Combine(origem, $"{livro.Isbn}.png");
                if (!File.Exists(arquivoOrigem))
                    continue;

                var bytes = await File.ReadAllBytesAsync(arquivoOrigem, cancelamento);
                var hash = Convert.ToHexString(SHA256.HashData(bytes))[..8].ToLowerInvariant();
                var nome = $"{Prefixo}{livro.Isbn}-{hash}.png";

                if (livro.ImagemArquivo == nome && File.Exists(Path.Combine(destino, nome)))
                    continue;

                await File.WriteAllBytesAsync(Path.Combine(destino, nome), bytes, cancelamento);

                var antiga = livro.ImagemArquivo;
                livro.ImagemArquivo = nome;
                aplicadas++;

                if (antiga != null && antiga != nome)
                {
                    var caminhoAntigo = Path.Combine(destino, Path.GetFileName(antiga));
                    if (File.Exists(caminhoAntigo))
                        File.Delete(caminhoAntigo);
                }
            }

            if (aplicadas == 0)
                return;

            await contexto.SaveChangesAsync(cancelamento);
            logger.LogInformation("Capas iniciais aplicadas ou atualizadas em {Livros} livros.", aplicadas);
        }
    }
}
