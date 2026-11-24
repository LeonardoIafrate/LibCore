using api.Dtos.Livro;

namespace api.Interfaces
{
    public interface ILivroImagemService
    {
        Task<LivroDto> DefinirAsync(int livroId, Stream conteudo, long tamanho, CancellationToken ct = default);
        Task<LivroDto> RemoverAsync(int livroId);

        /// <summary>Apaga o arquivo associado a uma URL pública devolvida pela API (usado ao excluir o livro).</summary>
        void LimparArquivo(string? imagemUrl);
    }
}
