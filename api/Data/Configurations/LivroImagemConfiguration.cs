using api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.Data.Configurations
{
    public class LivroImagemConfiguration : IEntityTypeConfiguration<LivroImagem>
    {
        public void Configure(EntityTypeBuilder<LivroImagem> builder)
        {
            builder.ToTable("LivroImagem");

            builder.HasKey(i => i.Id);

            builder.Property(i => i.Arquivo)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.HasOne(i => i.Livro)
                   .WithMany(l => l.Imagens)
                   .HasForeignKey(i => i.LivroId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
