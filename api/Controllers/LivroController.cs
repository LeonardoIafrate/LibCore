using api.Dtos.Livro;
using api.Helpers;
using api.Interfaces;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Authorize(Roles = nameof(PerfilUsuario.Admin))]
    [ApiController]
    [Route("api/livros")]
    public class LivroController : ControllerBase
    {
        private readonly ILivroService _livroService;
        private readonly ILivroImagemService _imagemService;

        public LivroController(ILivroService livroService, ILivroImagemService imagemService)
        {
            _livroService = livroService;
            _imagemService = imagemService;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<PagedResult<LivroDto>>> GetAll([FromQuery] LivroQueryObject query)
        {
            var livros = await _livroService.GetAllAsync(query);
            return Ok(livros);
        }

        [AllowAnonymous]
        [HttpGet("{id:int}")]
        public async Task<ActionResult<LivroDto>> GetById([FromRoute]int id)
        {
            var livro = await _livroService.GetByIdAsync(id);
            return Ok(livro);   
        }

        [AllowAnonymous]
        [HttpGet("isbn/{isbn}")]
        public async Task<ActionResult<LivroDto>> GetByIsbn([FromRoute] string isbn)
        {
            var livro = await _livroService.GetByIsbnAsync(isbn);
            return Ok(livro);
        }

        [HttpPost]
        public async Task<ActionResult<LivroDto>> Create([FromBody] CreateLivroDto dto)
        {
            var criada = await _livroService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new{id = criada.Id}, criada);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<LivroDto>> Update([FromRoute] int id, [FromBody] UpdateLivroDto dto)
        {
            var atualizada = await _livroService.UpdateAsync(id, dto);
            return Ok(atualizada);
        }

        [HttpPut("{id:int}/imagem")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(3 * 1024 * 1024)]
        public async Task<ActionResult<LivroDto>> DefinirImagem([FromRoute] int id, IFormFile arquivo, CancellationToken ct)
        {
            await using var stream = arquivo.OpenReadStream();
            var atualizado = await _imagemService.DefinirAsync(id, stream, arquivo.Length, ct);
            return Ok(atualizado);
        }

        [HttpPost("{id:int}/imagens")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(3 * 1024 * 1024)]
        public async Task<ActionResult<LivroDto>> AdicionarImagem([FromRoute] int id, IFormFile arquivo, CancellationToken ct)
        {
            await using var stream = arquivo.OpenReadStream();
            var atualizado = await _imagemService.AdicionarGaleriaAsync(id, stream, arquivo.Length, ct);
            return Ok(atualizado);
        }

        [HttpDelete("{id:int}/imagens/{imagemId:int}")]
        public async Task<ActionResult<LivroDto>> RemoverImagemDaGaleria([FromRoute] int id, [FromRoute] int imagemId)
        {
            var atualizado = await _imagemService.RemoverDaGaleriaAsync(id, imagemId);
            return Ok(atualizado);
        }

        [HttpDelete("{id:int}/imagem")]
        public async Task<ActionResult<LivroDto>> RemoverImagem([FromRoute] int id)
        {
            var atualizado = await _imagemService.RemoverAsync(id);
            return Ok(atualizado);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete([FromRoute]int id)
        {
            var livro = await _livroService.GetByIdAsync(id);
            await _livroService.DeleteAsync(id);
            _imagemService.LimparArquivo(livro.ImagemUrl);
            foreach(var imagem in livro.Imagens)
                _imagemService.LimparArquivo(imagem.Url);
            return NoContent();
        }
    }
}