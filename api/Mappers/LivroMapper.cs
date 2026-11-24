using api.Dtos.Livro;
using api.Models;
using api.Helpers;

namespace api.Mappers
{
    public static class LivroMapper
    {
        public const string PastaPublicaDeImagens = "/uploads/livros";

        public static LivroDto ToLivroDto(this Livro livro)
        {
            return new LivroDto
            {
                Id = livro.Id,
                Nome = livro.Nome,
                Sinopse = livro.Sinopse,
                AnoLancamento = livro.AnoLancamento,
                Isbn = livro.Isbn,
                Preco = livro.Preco,
                NumeroPaginas = livro.NumeroPaginas,
                Idioma = livro.Idioma,
                ImagemUrl = livro.ImagemArquivo == null ? null : $"{PastaPublicaDeImagens}/{livro.ImagemArquivo}",
                Imagens = livro.Imagens
                    .OrderBy(i => i.Ordem)
                    .ThenBy(i => i.Id)
                    .Select(i => new LivroImagemDto { Id = i.Id, Url = $"{PastaPublicaDeImagens}/{i.Arquivo}" })
                    .ToList(),
                DataCadastro = livro.DataCadastro,
                Autores = livro.Autores
                    .Select(a => a.Nome)
                    .OrderBy(n => n)
                    .ToList(),
                AutoresIds = livro.Autores
                    .OrderBy(a => a.Nome)
                    .Select(a => a.Id)
                    .ToList(),
                CategoriaIds = livro.Categorias
                    .OrderBy(c => c.Genero)
                    .Select(c => c.Id)
                    .ToList(),
                EditoraId = livro.EditoraId,
                EditoraNome = livro.Editora?.Nome?? string.Empty,
                Generos = livro.Categorias
                    .Select(c => c.Genero)
                    .OrderBy(g => g)
                    .ToList(),
                QuantidadeEstoque = livro.Estoque?.Quantidade ?? 0
            };
        }

        public static Livro ToLivroFromCreateDto(this CreateLivroDto dto)
        {
            return new Livro
            {
                Nome = dto.Nome.Trim(),
                Sinopse = dto.Sinopse.FormatarOpcional(),
                AnoLancamento = dto.AnoLancamento,
                Isbn = dto.Isbn.FormatarIsbn(),
                Preco = dto.Preco,
                NumeroPaginas = dto.NumeroPaginas,
                Idioma = dto.Idioma.FormatarOpcional(),
                EditoraId = dto.EditoraId
            };
        }

        public static Livro ToLivroFromUpdate(this UpdateLivroDto dto)
        {
            return new Livro
            {
                Nome = dto.Nome.Trim(),
                Sinopse = dto.Sinopse.FormatarOpcional(),
                AnoLancamento = dto.AnoLancamento,
                Isbn = dto.Isbn.FormatarIsbn(),
                Preco = dto.Preco,
                NumeroPaginas = dto.NumeroPaginas,
                Idioma = dto.Idioma.FormatarOpcional(),
                EditoraId = dto.EditoraId
            };
        }
        
    }
}