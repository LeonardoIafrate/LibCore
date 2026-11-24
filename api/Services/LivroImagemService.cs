using api.Dtos.Livro;
using api.Exceptions;
using api.Interfaces;
using api.Mappers;

namespace api.Services
{
    public class LivroImagemService : ILivroImagemService
    {
        public const long TamanhoMaximo = 2 * 1024 * 1024;
        public const int MaximoDeImagensAdicionais = 8;

        private readonly ILivroRepository _livroRepo;
        private readonly IImagemStorage _storage;

        public LivroImagemService(ILivroRepository livroRepo, IImagemStorage storage)
        {
            _livroRepo = livroRepo;
            _storage = storage;
        }

        public async Task<LivroDto> DefinirAsync(int livroId, Stream conteudo, long tamanho, CancellationToken ct = default)
        {
            if(tamanho <= 0)
                throw new BadRequestException("Envie um arquivo de imagem.");

            if(tamanho > TamanhoMaximo)
                throw new BadRequestException("A imagem deve ter no máximo 2 MB.");

            var existente = await _livroRepo.GetByIdAsync(livroId);
            if(existente == null)
                throw new NotFoundException("Livro não encontrado.");

            using var memoria = new MemoryStream();
            await conteudo.CopyToAsync(memoria, ct);
            var bytes = memoria.ToArray();

            if(bytes.Length > TamanhoMaximo)
                throw new BadRequestException("A imagem deve ter no máximo 2 MB.");

            var extensao = DetectarExtensao(bytes)
                ?? throw new BadRequestException("Formato inválido. Envie uma imagem JPEG, PNG ou WebP.");

            var antigo = existente.ImagemArquivo;
            var novo = await _storage.SalvarAsync(bytes, extensao, ct);

            try
            {
                var atualizado = await _livroRepo.AtualizarImagemAsync(livroId, novo);
                if(atualizado == null)
                    throw new NotFoundException("Livro não encontrado.");

                _storage.Remover(antigo);
                return atualizado.ToLivroDto();
            }
            catch
            {
                _storage.Remover(novo);
                throw;
            }
        }

        public async Task<LivroDto> AdicionarGaleriaAsync(int livroId, Stream conteudo, long tamanho, CancellationToken ct = default)
        {
            if(tamanho <= 0)
                throw new BadRequestException("Envie um arquivo de imagem.");

            if(tamanho > TamanhoMaximo)
                throw new BadRequestException("A imagem deve ter no máximo 2 MB.");

            var existente = await _livroRepo.GetByIdAsync(livroId);
            if(existente == null)
                throw new NotFoundException("Livro não encontrado.");

            if(existente.Imagens.Count >= MaximoDeImagensAdicionais)
                throw new BadRequestException($"Cada livro aceita no máximo {MaximoDeImagensAdicionais} imagens adicionais.");

            using var memoria = new MemoryStream();
            await conteudo.CopyToAsync(memoria, ct);
            var bytes = memoria.ToArray();

            if(bytes.Length > TamanhoMaximo)
                throw new BadRequestException("A imagem deve ter no máximo 2 MB.");

            var extensao = DetectarExtensao(bytes)
                ?? throw new BadRequestException("Formato inválido. Envie uma imagem JPEG, PNG ou WebP.");

            var arquivo = await _storage.SalvarAsync(bytes, extensao, ct);

            try
            {
                var atualizado = await _livroRepo.AdicionarImagemAsync(livroId, arquivo);
                if(atualizado == null)
                    throw new NotFoundException("Livro não encontrado.");

                return atualizado.ToLivroDto();
            }
            catch
            {
                _storage.Remover(arquivo);
                throw;
            }
        }

        public async Task<LivroDto> RemoverDaGaleriaAsync(int livroId, int imagemId)
        {
            var existente = await _livroRepo.GetByIdAsync(livroId);
            if(existente == null)
                throw new NotFoundException("Livro não encontrado.");

            var imagem = existente.Imagens.FirstOrDefault(i => i.Id == imagemId);
            if(imagem == null)
                throw new NotFoundException("Imagem não encontrada.");

            var arquivo = imagem.Arquivo;
            var atualizado = await _livroRepo.RemoverImagemAsync(livroId, imagemId);
            if(atualizado == null)
                throw new NotFoundException("Livro não encontrado.");

            _storage.Remover(arquivo);
            return atualizado.ToLivroDto();
        }

        public async Task<LivroDto> RemoverAsync(int livroId)
        {
            var existente = await _livroRepo.GetByIdAsync(livroId);
            if(existente == null)
                throw new NotFoundException("Livro não encontrado.");

            var antigo = existente.ImagemArquivo;
            var atualizado = await _livroRepo.AtualizarImagemAsync(livroId, null);
            if(atualizado == null)
                throw new NotFoundException("Livro não encontrado.");

            _storage.Remover(antigo);
            return atualizado.ToLivroDto();
        }

        public void LimparArquivo(string? imagemUrl)
        {
            if(string.IsNullOrWhiteSpace(imagemUrl))
                return;

            _storage.Remover(Path.GetFileName(imagemUrl));
        }

        // O tipo é decidido pelo conteúdo, nunca pelo nome ou Content-Type enviados pelo cliente.
        private static string? DetectarExtensao(byte[] b)
        {
            if(b.Length >= 3 && b[0] == 0xFF && b[1] == 0xD8 && b[2] == 0xFF)
                return ".jpg";

            if(b.Length >= 8 && b[0] == 0x89 && b[1] == 0x50 && b[2] == 0x4E && b[3] == 0x47
               && b[4] == 0x0D && b[5] == 0x0A && b[6] == 0x1A && b[7] == 0x0A)
                return ".png";

            if(b.Length >= 12 && b[0] == 0x52 && b[1] == 0x49 && b[2] == 0x46 && b[3] == 0x46
               && b[8] == 0x57 && b[9] == 0x45 && b[10] == 0x42 && b[11] == 0x50)
                return ".webp";

            return null;
        }
    }
}
