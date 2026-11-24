using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class LimitarTamanohDaSinopse : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "C_ItemPedido_PrecoUnitario",
                table: "ItemPedido");

            migrationBuilder.DropCheckConstraint(
                name: "C_ItemPedido_Quantidade",
                table: "ItemPedido");

            migrationBuilder.AlterColumn<string>(
                name: "Sinopse",
                table: "Livro",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_ItemPedido_PrecoUnitario",
                table: "ItemPedido",
                sql: "[PrecoUnitario] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_ItemPedido_Quantidade",
                table: "ItemPedido",
                sql: "[Quantidade] > 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_ItemPedido_PrecoUnitario",
                table: "ItemPedido");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ItemPedido_Quantidade",
                table: "ItemPedido");

            migrationBuilder.AlterColumn<string>(
                name: "Sinopse",
                table: "Livro",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "C_ItemPedido_PrecoUnitario",
                table: "ItemPedido",
                sql: "[PrecoUnitario] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "C_ItemPedido_Quantidade",
                table: "ItemPedido",
                sql: "[Quantidade] > 0");
        }
    }
}
