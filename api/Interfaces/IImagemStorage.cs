namespace api.Interfaces
{
    public interface IImagemStorage
    {
        /// <summary>Grava a imagem e devolve o nome do arquivo gerado.</summary>
        Task<string> SalvarAsync(byte[] conteudo, string extensao, CancellationToken ct = default);

        /// <summary>Remove o arquivo, se existir. Nunca lança por arquivo ausente.</summary>
        void Remover(string? arquivo);
    }
}
