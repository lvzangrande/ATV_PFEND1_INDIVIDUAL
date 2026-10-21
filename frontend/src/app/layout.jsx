import "./globals.css";

export const metadata = {
  title: "Química Comercial | Produtos e vendas",
  description: "Demonstração de cadastro, estoque e vendas de produtos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
