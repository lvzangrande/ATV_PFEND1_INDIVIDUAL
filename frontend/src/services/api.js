const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

async function requisitar(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      headers: {
        'Content-Type': 'application/json',
        ...opcoes.headers,
      },
      cache: 'no-store',
    });
  } catch {
    throw new Error(`Não foi possível conectar à API em ${API_URL}. Confira se o servidor está ativo.`);
  }

  let resultado;
  try {
    resultado = await resposta.json();
  } catch {
    throw new Error('A API retornou uma resposta inválida.');
  }
  if (!resposta.ok) {
    throw new Error(resultado.erro || 'A API não conseguiu concluir a operação.');
  }
  return resultado;
}

function enviar(method, dados) {
  return {
    method,
    body: JSON.stringify(dados),
  };
}

export function carregarPainel() {
  return Promise.all([
    requisitar('/api/produtos'),
    requisitar('/api/vendas'),
    requisitar('/api/dashboard'),
    requisitar('/api/empresas'),
    requisitar('/api/usuarios'),
  ]);
}

export function criarProduto(produto) {
  return requisitar('/api/produtos', enviar('POST', produto));
}

export function atualizarProduto(produto) {
  return requisitar(`/api/produtos/${produto.tipo}/${produto.id}`, enviar('PUT', produto));
}

export function removerProduto(produto) {
  return requisitar(`/api/produtos/${produto.tipo}/${produto.id}`, { method: 'DELETE' });
}

export function criarEmpresa(empresa) {
  return requisitar('/api/empresas', enviar('POST', empresa));
}

export function atualizarEmpresa(empresa) {
  return requisitar(`/api/empresas/${empresa.id}`, enviar('PUT', empresa));
}

export function removerEmpresa(id) {
  return requisitar(`/api/empresas/${id}`, { method: 'DELETE' });
}

export function criarUsuario(usuario) {
  return requisitar('/api/usuarios', enviar('POST', usuario));
}

export function atualizarUsuario(usuario) {
  return requisitar(`/api/usuarios/${usuario.id}`, enviar('PUT', usuario));
}

export function removerUsuario(id) {
  return requisitar(`/api/usuarios/${id}`, { method: 'DELETE' });
}

export function criarVenda(produtoId, tipo, quantidade, empresaId) {
  return requisitar('/api/vendas', enviar('POST', { produtoId, tipo, quantidade, empresaId }));
}
