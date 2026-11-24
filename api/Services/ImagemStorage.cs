using api.Interfaces;

namespace api.Services
{
    public class ImagemStorage : IImagemStorage
    {
        private readonly string _pasta;

        public ImagemStorage(IWebHostEnvironment ambiente)
        {
            _pasta = Path.Combine(ambiente.ContentRootPath, "wwwroot", "uploads", "livros");
            Directory.CreateDirectory(_pasta);
        }

        public string Pasta => _pasta;

        public async Task<string> SalvarAsync(byte[] conteudo, string extensao, CancellationToken ct = default)
        {
            var arquivo = $"{Guid.NewGuid():N}{extensao}";
            await File.WriteAllBytesAsync(Path.Combine(_pasta, arquivo), conteudo, ct);
            return arquivo;
        }

        public void Remover(string? arquivo)
        {
            if(string.IsNullOrWhiteSpace(arquivo))
                return;

            // Path.GetFileName impede que um valor adulterado saia da pasta de uploads.
            var caminho = Path.Combine(_pasta, Path.GetFileName(arquivo));

            try
            {
                if(File.Exists(caminho))
                    File.Delete(caminho);
            }
            catch(IOException)
            {
                // Arquivo órfão não deve derrubar a operação principal.
            }
        }
    }
}
