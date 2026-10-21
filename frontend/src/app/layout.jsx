import "./globals.css";

export const metadata = {
  title: "Índice | Mercado financeiro",
  description: "Painel demonstrativo para acompanhar ativos, posições e operações financeiras.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
