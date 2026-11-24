using api.Exceptions;
using api.Interfaces;
using api.Models;
using api.Services;
using NSubstitute;
using Xunit;

namespace api.Tests.Services;

public class LivroImagemServiceTests
{
    private const int LivroId = 1;

    private readonly ILivroRepository _livroRepo = Substitute.For<ILivroRepository>();
    private readonly IImagemStorage _storage = Substitute.For<IImagemStorage>();

    private LivroImagemService CriarServico() => new(_livroRepo, _storage);

    private static Livro CriarLivro(string? imagem = null) => new()
    {
        Id = LivroId,
        Nome = "Dom Casmurro",
        Isbn = "9788535914849",
        Preco = 30m,
        EditoraId = 1,
        Editora = new Editora { Id = 1, Nome = "Editora Teste" },
        ImagemArquivo = imagem
    };

    private static readonly byte[] Png = { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x01 };
    private static readonly byte[] Jpeg = { 0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10 };
    private static readonly byte[] Texto = { 0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00 };

    [Fact]
    public async Task Definir_ImagemPng_SalvaAtualizaERemoveArquivoAntigo()
    {
        _livroRepo.GetByIdAsync(LivroId).Returns(CriarLivro("antigo.jpg"));
        _storage.SalvarAsync(Arg.Any<byte[]>(), ".png", Arg.Any<CancellationToken>()).Returns("novo.png");
        _livroRepo.AtualizarImagemAsync(LivroId, "novo.png").Returns(CriarLivro("novo.png"));

        using var stream = new MemoryStream(Png);
        var resultado = await CriarServico().DefinirAsync(LivroId, stream, Png.Length);

        Assert.Equal("/uploads/livros/novo.png", resultado.ImagemUrl);
        _storage.Received(1).Remover("antigo.jpg");
    }

    [Fact]
    public async Task Definir_ImagemJpeg_UsaExtensaoJpg()
    {
        _livroRepo.GetByIdAsync(LivroId).Returns(CriarLivro());
        _storage.SalvarAsync(Arg.Any<byte[]>(), ".jpg", Arg.Any<CancellationToken>()).Returns("capa.jpg");
        _livroRepo.AtualizarImagemAsync(LivroId, "capa.jpg").Returns(CriarLivro("capa.jpg"));

        using var stream = new MemoryStream(Jpeg);
        await CriarServico().DefinirAsync(LivroId, stream, Jpeg.Length);

        await _storage.Received(1).SalvarAsync(Arg.Any<byte[]>(), ".jpg", Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Definir_ConteudoQueNaoEImagem_LancaBadRequestENaoGrava()
    {
        _livroRepo.GetByIdAsync(LivroId).Returns(CriarLivro());

        using var stream = new MemoryStream(Texto);

        await Assert.ThrowsAsync<BadRequestException>(
            () => CriarServico().DefinirAsync(LivroId, stream, Texto.Length));

        await _storage.DidNotReceive().SalvarAsync(Arg.Any<byte[]>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Definir_ArquivoMaiorQueOLimite_LancaBadRequest()
    {
        using var stream = new MemoryStream(Png);

        await Assert.ThrowsAsync<BadRequestException>(
            () => CriarServico().DefinirAsync(LivroId, stream, LivroImagemService.TamanhoMaximo + 1));
    }

    [Fact]
    public async Task Definir_LivroInexistente_LancaNotFound()
    {
        _livroRepo.GetByIdAsync(LivroId).Returns((Livro?)null);

        using var stream = new MemoryStream(Png);

        await Assert.ThrowsAsync<NotFoundException>(
            () => CriarServico().DefinirAsync(LivroId, stream, Png.Length));
    }

    [Fact]
    public async Task Remover_LimpaCampoERemoveArquivo()
    {
        _livroRepo.GetByIdAsync(LivroId).Returns(CriarLivro("capa.png"));
        _livroRepo.AtualizarImagemAsync(LivroId, null).Returns(CriarLivro());

        var resultado = await CriarServico().RemoverAsync(LivroId);

        Assert.Null(resultado.ImagemUrl);
        _storage.Received(1).Remover("capa.png");
    }

    [Fact]
    public void LimparArquivo_UsaApenasONomeDoArquivo()
    {
        CriarServico().LimparArquivo("/uploads/livros/capa.png");

        _storage.Received(1).Remover("capa.png");
    }
}
