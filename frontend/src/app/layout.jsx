import "./globals.css";

export const metadata = {
  title: "Índice | Mercado financeiro",
  description: "Acompanhe ativos, posições e operações financeiras em uma única carteira.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
