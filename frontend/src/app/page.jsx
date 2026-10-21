'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  atualizarProduto,
  atualizarEmpresa,
  atualizarUsuario,
  carregarPainel,
  criarEmpresa,
  criarProduto,
  criarUsuario,
  criarVenda,
  removerEmpresa,
  removerProduto,
  removerUsuario,
} from '@/services/api';

const categoriasNegociaveis = [
  'Ações brasileiras',
  'Ações internacionais e BDRs',
  'Fundos imobiliários (FIIs)',
  'Fundos de índice (ETFs)',
  'Criptomoedas',
  'Renda fixa',
  'Commodities',
  'Índices de mercado',
  'Moedas',
  'Fundos de investimento',
];

const categoriasMonitoradas = [
  'Opções',
  'Contratos futuros',
  'Derivativos',
  'Ativos em observação',
  'Ativos internacionais',
  'Criptoativos em observação',
  'Renda fixa com vencimento',
  'Fundos fechados',
  'Índices globais',
  'Outros instrumentos financeiros',
];

const formularioInicial = {
  nome: '',
  status: 'NEGOCIAVEL',
  categoria: '',
  preco: '',
  descricao: '',
  posicao: '',
};

function formatarMoeda(valor) {
  if (valor === null || valor === undefined) return 'Sem preço';
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [resumo, setResumo] = useState({ produtos: 0, unidades: 0, vendas: 0, totalVendido: 0 });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [busca, setBusca] = useState('');
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [produtoDaVenda, setProdutoDaVenda] = useState('');
  const [quantidadeVenda, setQuantidadeVenda] = useState('1');
  const [aviso, setAviso] = useState('');
  const [erro, setErro] = useState('');
  const [apiIndisponivel, setApiIndisponivel] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [registrandoVenda, setRegistrandoVenda] = useState(false);
  const [empresaDaVenda, setEmpresaDaVenda] = useState('');
  const [empresaEmEdicao, setEmpresaEmEdicao] = useState(null);
  const [usuarioEmEdicao, setUsuarioEmEdicao] = useState(null);
  const [formularioEmpresa, setFormularioEmpresa] = useState({ nome: '', email_rep: '', CNPJ: '', descricao: '' });
  const [formularioUsuario, setFormularioUsuario] = useState({ nome: '', email: '', CPF: '', CNPJ: '', senha: '' });
  const [salvandoCadastro, setSalvandoCadastro] = useState(false);

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    return produtos.filter((produto) => {
      const tipoCorrespondente = filtroTipo === 'TODOS' || produto.tipo === filtroTipo;
      const textoCorrespondente = !termo
        || `${produto.nome} ${produto.categoria}`.toLocaleLowerCase('pt-BR').includes(termo);
      return tipoCorrespondente && textoCorrespondente;
    });
  }, [busca, filtroTipo, produtos]);

  const produtosParaVenda = produtos.filter(
    (produto) => produto.status === 'NEGOCIAVEL' && produto.posicao > 0 && produto.preco !== null,
  );
  async function atualizarPainel() {
    setAtualizando(true);
    try {
      const [listaProdutos, listaVendas, dadosResumo, listaEmpresas, listaUsuarios] = await carregarPainel();
      setProdutos(listaProdutos);
      setVendas(listaVendas);
      setResumo(dadosResumo);
      setEmpresas(listaEmpresas);
      setUsuarios(listaUsuarios);
      setApiIndisponivel(false);
      setErro('');
    } catch (falha) {
      setApiIndisponivel(true);
      setErro(falha.message);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useEffect(() => {
    atualizarPainel();
  }, []);

  function alterarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((atual) => ({
      ...atual,
      [name]: value,
      ...(name === 'status' ? { categoria: '' } : {}),
    }));
    setErro('');
    setAviso('');
  }

  function limparFormulario() {
    setFormulario(formularioInicial);
    setProdutoEmEdicao(null);
  }

  async function salvarProduto(evento) {
    evento.preventDefault();
    const categoriaValida = formulario.status === 'NEGOCIAVEL' ? categoriasNegociaveis : categoriasMonitoradas;
    const preco = formulario.preco === '' ? null : Number(formulario.preco);
    const posicao = Number(formulario.posicao);

    if (!formulario.nome.trim()) {
      setErro('Informe o nome do ativo.');
      return;
    }
    if (!categoriaValida.includes(formulario.categoria)) {
      setErro('Selecione uma classe de ativo válida.');
      return;
    }
    if (!Number.isSafeInteger(posicao) || posicao < 0) {
      setErro('A posição deve ser um número inteiro igual ou maior que zero.');
      return;
    }
    if (preco !== null && (!Number.isFinite(preco) || preco < 0)) {
      setErro('O preço deve ser um número igual ou maior que zero.');
      return;
    }

    const dados = {
      nome: formulario.nome.trim(),
      status: formulario.status,
      categoria: formulario.categoria,
      preco,
      descricao: formulario.descricao.trim(),
      posicao,
    };

    setSalvando(true);
    setErro('');
    setAviso('');
    try {
      if (produtoEmEdicao) {
        await atualizarProduto({ ...dados, id: produtoEmEdicao.id, status: produtoEmEdicao.status });
        setAviso('Ativo atualizado na sua carteira.');
      } else {
        await criarProduto(dados);
        setAviso('Ativo adicionado à sua carteira.');
      }
      await atualizarPainel();
      limparFormulario();
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setSalvando(false);
    }
  }

  function editarProduto(produto) {
    setProdutoEmEdicao(produto);
    setFormulario({
      nome: produto.nome,
      status: produto.status,
      categoria: produto.categoria,
      preco: produto.preco === null ? '' : String(produto.preco),
      descricao: produto.descricao,
      posicao: String(produto.posicao),
    });
    setErro('');
    setAviso('');
    document.getElementById('form-produto')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function excluirProduto(produto) {
    if (!window.confirm(`Remover o ativo "${produto.nome}" do banco de dados?`)) return;
    setErro('');
    setAviso('');
    try {
      await removerProduto(produto);
      if (produtoEmEdicao?.id === produto.id && produtoEmEdicao.status === produto.status) limparFormulario();
      setAviso('Ativo removido da sua carteira.');
      await atualizarPainel();
    } catch (falha) {
      setErro(falha.message);
    }
  }

  async function registrarVenda(evento) {
    evento.preventDefault();
    const produto = produtos.find((item) => item.status === 'NEGOCIAVEL' && item.id === Number(produtoDaVenda));
    const quantidade = Number(quantidadeVenda);

    if (!produto || produto.status !== 'NEGOCIAVEL' || produto.preco === null) {
      setErro('Selecione um ativo negociável com preço definido.');
      return;
    }
    if (!Number.isSafeInteger(quantidade) || quantidade < 1) {
      setErro('Informe uma quantidade inteira maior que zero.');
      return;
    }
    if (quantidade > produto.posicao) {
      setErro(`Posição insuficiente. Unidades disponíveis: ${produto.posicao}.`);
      return;
    }

    setAviso('');
    setRegistrandoVenda(true);
    try {
      await criarVenda(
        produto.id,
        produto.status,
        quantidade,
        empresaDaVenda ? Number(empresaDaVenda) : null,
      );
      setAviso('');
      setQuantidadeVenda('1');
      setAviso('Venda registrada. Sua posição foi atualizada.');
      await atualizarPainel();
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setRegistrandoVenda(false);
    }
  }

  async function salvarEmpresa(evento) {
    evento.preventDefault();
    setSalvandoCadastro(true);
    setErro('');
    setAviso('');
    try {
      if (empresaEmEdicao) {
        await atualizarEmpresa({ ...formularioEmpresa, id: empresaEmEdicao.id });
        setAviso('Organização atualizada.');
      } else {
        await criarEmpresa(formularioEmpresa);
        setAviso('Organização adicionada.');
      }
      setFormularioEmpresa({ nome: '', email_rep: '', CNPJ: '', descricao: '' });
      setEmpresaEmEdicao(null);
      await atualizarPainel();
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setSalvandoCadastro(false);
    }
  }

  async function salvarUsuario(evento) {
    evento.preventDefault();
    setSalvandoCadastro(true);
    setErro('');
    setAviso('');
    try {
      if (usuarioEmEdicao) {
        await atualizarUsuario({ ...formularioUsuario, id: usuarioEmEdicao.id });
        setAviso('Cadastro do investidor atualizado.');
      } else {
        await criarUsuario(formularioUsuario);
        setAviso('Investidor adicionado.');
      }
      setFormularioUsuario({ nome: '', email: '', CPF: '', CNPJ: '', senha: '' });
      setUsuarioEmEdicao(null);
      await atualizarPainel();
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setSalvandoCadastro(false);
    }
  }

  async function excluirEmpresa(empresa) {
    if (!window.confirm(`Remover a organização "${empresa.nome}"?`)) return;
    setErro('');
    setAviso('');
    try {
      await removerEmpresa(empresa.id);
      if (empresaEmEdicao?.id === empresa.id) {
        setEmpresaEmEdicao(null);
        setFormularioEmpresa({ nome: '', email_rep: '', CNPJ: '', descricao: '' });
      }
      setAviso('Organização removida.');
      await atualizarPainel();
    } catch (falha) {
      setErro(falha.message);
    }
  }

  async function excluirUsuario(usuario) {
    if (!window.confirm(`Remover o investidor "${usuario.nome}"?`)) return;
    setErro('');
    setAviso('');
    try {
      await removerUsuario(usuario.id);
      if (usuarioEmEdicao?.id === usuario.id) {
        setUsuarioEmEdicao(null);
        setFormularioUsuario({ nome: '', email: '', CPF: '', CNPJ: '', senha: '' });
      }
      setAviso('Investidor removido.');
      await atualizarPainel();
    } catch (falha) {
      setErro(falha.message);
    }
  }

  return (
    <main>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#inicio" aria-label="Índice, início">
            <span className="brand-icon" aria-hidden="true">I</span>
            <span><strong>ÍNDICE</strong><small>SEU ESPAÇO DE INVESTIMENTO</small></span>
          </a>
          <nav className="top-nav" aria-label="Navegação principal">
            <a className="nav-active" href="#mercado">Visão geral</a>
            <a href="#catalogo">Ativos</a>
            <a href="#operacoes">Negociação</a>
            <a href="#administracao">Investidores</a>
          </nav>
          <div className="topbar-tools">
            <span className="topbar-note">
              <i className={apiIndisponivel ? 'connection-dot connection-error' : 'connection-dot'} aria-hidden="true" />
              {carregando ? 'Sincronizando' : apiIndisponivel ? 'API indisponível' : 'Conectado'}
            </span>
            <span className="profile-link" aria-label="Modo demonstração">
              <span className="profile-avatar" aria-hidden="true">D</span>
              <span>Modo demonstração</span>
            </span>
          </div>
        </div>
      </header>

      <div className="market-strip" id="mercado" aria-label="Indicadores de mercado ilustrativos">
        <div className="market-strip-inner">
          <span className="market-label"><i aria-hidden="true" /> MERCADO EM FOCO</span>
          <span className="market-quote"><strong>IBOV</strong><b>132.480,24</b><em>+0,82%</em></span>
          <span className="market-quote"><strong>USD/BRL</strong><b>5,42</b><em className="market-down">−0,17%</em></span>
          <span className="market-quote"><strong>BTC/BRL</strong><b>362.180,50</b><em>+2,41%</em></span>
          <span className="market-quote"><strong>ETH/BRL</strong><b>19.320,00</b><em>+1,08%</em></span>
          <span className="market-disclaimer">Indicadores ilustrativos</span>
        </div>
      </div>

      <div className="page-wrap" id="inicio">
        <section className="dashboard-intro">
          <div className="welcome">
            <div>
              <p className="overline">PAINEL DE INVESTIMENTOS <span className="live-indicator">DEMONSTRAÇÃO</span></p>
              <h1>Mercado em perspectiva</h1>
              <p>Acompanhe ativos, organize posições e registre suas operações em um só lugar.</p>
            </div>
            <a className="primary-button" href="#cadastro">＋ Novo ativo</a>
          </div>
          <section className="market-disclaimer-banner" aria-label="Aviso sobre os dados">
            <strong>Uma observação importante</strong>
            <span>Os valores são fictícios: esta demonstração não mostra cotações ao vivo nem recomenda investimentos.</span>
          </section>
        </section>

        <section className="portfolio-overview" aria-label="Resumo da carteira">
          <div className="overview-heading">
            <div><p className="overline">VISÃO DA CARTEIRA</p><h2>Resumo da sua carteira</h2></div>
            <span className="overview-period">POSIÇÃO ATUAL</span>
          </div>
          <div className="stats-grid">
            <article className="stat-card">
              <span className="stat-icon icon-blue" aria-hidden="true">▦</span>
              <div><p>Ativos acompanhados</p><strong>{resumo.produtos}</strong></div>
            </article>
            <article className="stat-card">
              <span className="stat-icon icon-green" aria-hidden="true">✓</span>
              <div><p>Unidades em posição</p><strong>{resumo.unidades}</strong></div>
            </article>
            <article className="stat-card">
              <span className="stat-icon icon-amber" aria-hidden="true">↗</span>
              <div><p>Operações registradas</p><strong>{resumo.vendas}</strong></div>
            </article>
            <article className="stat-card">
              <span className="stat-icon icon-purple" aria-hidden="true">R$</span>
              <div><p>Volume movimentado</p><strong>{formatarMoeda(resumo.totalVendido)}</strong></div>
            </article>
          </div>
        </section>

        {(erro || aviso) && (
          <div className={`notice ${erro ? 'notice-error' : 'notice-success'}`} role={erro ? 'alert' : 'status'}>
            <span>{erro || aviso}</span>
            {erro && <button className="quiet-button" onClick={atualizarPainel} type="button" disabled={atualizando}>{atualizando ? 'Atualizando...' : 'Tentar novamente'}</button>}
          </div>
        )}

        <section className="content-grid">
          <div className="main-column">
            <section className="panel" id="catalogo">
              <div className="panel-heading">
                <div><p className="overline">UNIVERSO DE INVESTIMENTO</p><h2>Ativos acompanhados</h2></div>
                <span className="record-count">{produtosFiltrados.length} ativos</span>
              </div>

              <div className="catalog-controls">
                <div className="filter-tabs" role="group" aria-label="Filtrar ativos">
                  {[
                    ['TODOS', 'Todos'],
                    ['NEGOCIAVEL', 'Negociáveis'],
                    ['MONITORADO', 'Monitoramento'],
                  ].map(([tipo, rotulo]) => (
                    <button
                      className={filtroTipo === tipo ? 'filter-tab active' : 'filter-tab'}
                      key={tipo}
                      onClick={() => setFiltroTipo(tipo)}
                      type="button"
                    >
                      {rotulo}
                    </button>
                  ))}
                </div>
                <label className="search-box">
                  <span aria-hidden="true">⌕</span>
                  <input
                    aria-label="Buscar ativo"
                    onChange={(evento) => setBusca(evento.target.value)}
                    placeholder="Buscar ativo ou classe..."
                    value={busca}
                  />
                </label>
              </div>

              {carregando ? (
                <div className="empty-state"><strong>Carregando ativos...</strong></div>
              ) : produtosFiltrados.length === 0 ? (
                <div className="empty-state">
                  <span aria-hidden="true">▧</span>
                  <strong>{apiIndisponivel ? 'Não foi possível carregar sua carteira' : 'Sua carteira ainda está vazia'}</strong>
                  <p>{apiIndisponivel ? 'Confira a conexão e tente novamente pelo aviso acima.' : 'Adicione seu primeiro ativo para começar.'}</p>
                </div>
              ) : (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Ativo</th>
                        <th>Classe</th>
                        <th>Status</th>
                        <th>Preço unitário</th>
                        <th>Posição</th>
                        <th><span className="visually-hidden">Ações</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {produtosFiltrados.map((produto) => (
                        <tr key={`${produto.tipo}-${produto.id}`}>
                          <td>
                            <strong className="product-name">{produto.nome}</strong>
                            <span className="product-description">{produto.descricao || 'Sem observações'}</span>
                          </td>
                          <td className="category-cell">{produto.categoria}</td>
                          <td><span className={`type-badge ${produto.status === 'NEGOCIAVEL' ? 'type-free' : 'type-controlled'}`}>
                            {produto.status === 'NEGOCIAVEL' ? 'Negociável' : 'Monitoramento'}
                          </span></td>
                          <td className="price-cell">{formatarMoeda(produto.preco)}</td>
                          <td><span className={`stock-value ${produto.posicao < 10 ? 'stock-low' : ''}`}>{produto.posicao}</span></td>
                          <td>
                            <div className="table-actions">
                              <button aria-label={`Editar ${produto.nome}`} className="icon-button" onClick={() => editarProduto(produto)} title="Editar" type="button">✎</button>
                              <button aria-label={`Excluir ${produto.nome}`} className="icon-button delete-action" onClick={() => excluirProduto(produto)} title="Excluir" type="button">×</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="panel-footnote">Ativos cadastrados para organização de carteira. Os preços não são cotações em tempo real.</p>
            </section>

            <section className="panel" id="cadastro">
              <div className="panel-heading">
                <div><p className="overline">CARTEIRA</p><h2>{produtoEmEdicao ? 'Editar ativo' : 'Cadastrar ativo'}</h2></div>
                {produtoEmEdicao && <button className="quiet-button" onClick={limparFormulario} type="button">Cancelar edição</button>}
              </div>
              <form className="product-form" id="form-produto" onSubmit={salvarProduto}>
                <label className="form-field">
                  Nome ou ticker <span>*</span>
                  <input maxLength="255" name="nome" onChange={alterarCampo} required value={formulario.nome} disabled={salvando} />
                </label>
                <label className="form-field">
                  Status do ativo <span>*</span>
                  <select name="status" onChange={alterarCampo} value={formulario.status} disabled={salvando || Boolean(produtoEmEdicao)}>
                    <option value="NEGOCIAVEL">Negociável</option>
                    <option value="MONITORADO">Apenas monitoramento</option>
                  </select>
                </label>
                <label className="form-field form-wide">
                  Classe do ativo <span>*</span>
                  <select name="categoria" onChange={alterarCampo} required value={formulario.categoria} disabled={salvando}>
                    <option value="">Selecione uma classe</option>
                    {(formulario.status === 'NEGOCIAVEL' ? categoriasNegociaveis : categoriasMonitoradas).map((categoria) => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  Preço unitário (R$)
                  <input min="0" name="preco" onChange={alterarCampo} placeholder="0,00" step="0.01" type="number" value={formulario.preco} disabled={salvando} />
                </label>
                <label className="form-field">
                  Unidades em posição <span>*</span>
                  <input min="0" name="posicao" onChange={alterarCampo} required step="1" type="number" value={formulario.posicao} disabled={salvando} />
                </label>
                <label className="form-field form-wide">
                  Tese ou observações
                  <textarea maxLength="255" name="descricao" onChange={alterarCampo} rows="2" value={formulario.descricao} disabled={salvando} />
                </label>
                {formulario.status === 'MONITORADO' && (
                  <p className="form-guidance form-wide">
                    Ativos em monitoramento são exibidos na carteira, mas não podem ser negociados por este painel.
                  </p>
                )}
                <div className="form-actions form-wide">
                  <button className="secondary-button" onClick={limparFormulario} type="button" disabled={salvando}>Limpar</button>
                  <button className="primary-button" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : produtoEmEdicao ? 'Salvar alterações' : 'Adicionar ativo'}</button>
                </div>
              </form>
            </section>
          </div>

          <aside className="side-column">
            <section className="panel" id="operacoes">
              <div className="panel-heading">
                <div><p className="overline">ORDEM MANUAL</p><h2>Registrar venda</h2></div>
                <span className="sale-icon" aria-hidden="true">↗</span>
              </div>
              <p className="helper-copy">Registre uma venda simulada e acompanhe a redução da posição.</p>
              <form className="sale-form" onSubmit={registrarVenda}>
                <label className="form-field">
                  Ativo
                  <select onChange={(evento) => setProdutoDaVenda(evento.target.value)} value={produtoDaVenda} disabled={registrandoVenda}>
                    <option value="">Selecione um ativo</option>
                    {produtosParaVenda.map((produto) => (
                      <option key={produto.id} value={produto.id}>{produto.nome} — {formatarMoeda(produto.preco)}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  Quantidade de unidades
                  <input min="1" onChange={(evento) => setQuantidadeVenda(evento.target.value)} step="1" type="number" value={quantidadeVenda} disabled={registrandoVenda} />
                </label>
                <label className="form-field">
                  Corretora ou organização (opcional)
                  <select onChange={(evento) => setEmpresaDaVenda(evento.target.value)} value={empresaDaVenda} disabled={registrandoVenda}>
                    <option value="">Sem organização vinculada</option>
                    {empresas.map((empresa) => (
                      <option key={empresa.id} value={empresa.id}>{empresa.nome}</option>
                    ))}
                  </select>
                </label>
                <button className="primary-button full-button" disabled={produtosParaVenda.length === 0 || registrandoVenda} type="submit">
                  {registrandoVenda ? 'Registrando...' : 'Registrar venda'}
                </button>
              </form>
              <p className="form-guidance">A venda é registrada no banco e reduz as unidades disponíveis. Este painel demonstrativo não envia ordens para corretoras.</p>
            </section>

            <section className="panel sales-panel">
              <div className="panel-heading">
                <div><p className="overline">HISTÓRICO</p><h2>Operações recentes</h2></div>
                <span className="record-count">{vendas.length}</span>
              </div>
              {vendas.length === 0 ? (
                <p className="sales-empty">As operações registradas aparecerão aqui.</p>
              ) : (
                <ul className="sales-list">
                  {vendas.slice(0, 5).map((venda) => (
                    <li key={venda.id}>
                      <span className="sale-dot" aria-hidden="true">✓</span>
                          <span className="sale-description"><strong>{venda.produto}</strong><small>{venda.quantidade} un. · {venda.data}{venda.empresa ? ` · ${venda.empresa}` : ''}</small></span>
                      <strong className="sale-total">{formatarMoeda(venda.quantidade * venda.preco)}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </section>

        <section className="panel admin-panel" id="administracao">
          <div className="panel-heading">
            <div><p className="overline">ACESSO E PARTICIPANTES</p><h2>Organizações e investidores</h2></div>
            <span className="record-count">{empresas.length} organizações · {usuarios.length} investidores</span>
          </div>

          <div className="admin-grid">
            <section className="admin-section">
              <div className="admin-section-heading">
                <h3>{empresaEmEdicao ? 'Editar organização' : 'Cadastrar organização'}</h3>
                {empresaEmEdicao && (
                  <button
                    className="quiet-button"
                    onClick={() => {
                      setEmpresaEmEdicao(null);
                      setFormularioEmpresa({ nome: '', email_rep: '', CNPJ: '', descricao: '' });
                    }}
                    type="button"
                  >
                    Cancelar
                  </button>
                )}
              </div>
              <form className="admin-form" onSubmit={salvarEmpresa}>
                <label className="form-field">Nome da organização <span>*</span>
                  <input maxLength="255" onChange={(evento) => setFormularioEmpresa({ ...formularioEmpresa, nome: evento.target.value })} required value={formularioEmpresa.nome} />
                </label>
                <label className="form-field">E-mail de contato <span>*</span>
                  <input onChange={(evento) => setFormularioEmpresa({ ...formularioEmpresa, email_rep: evento.target.value })} required type="email" value={formularioEmpresa.email_rep} />
                </label>
                <label className="form-field">CNPJ <span>*</span>
                  <input maxLength="18" onChange={(evento) => setFormularioEmpresa({ ...formularioEmpresa, CNPJ: evento.target.value })} placeholder="Somente 14 dígitos" required value={formularioEmpresa.CNPJ} />
                </label>
                <label className="form-field">Perfil da organização <span>*</span>
                  <input maxLength="255" onChange={(evento) => setFormularioEmpresa({ ...formularioEmpresa, descricao: evento.target.value })} required value={formularioEmpresa.descricao} />
                </label>
                <button className="primary-button admin-submit" disabled={salvandoCadastro} type="submit">
                  {salvandoCadastro ? 'Salvando...' : empresaEmEdicao ? 'Salvar organização' : 'Cadastrar organização'}
                </button>
              </form>
              <div className="admin-records">
                {empresas.length === 0 ? <p className="admin-empty">Nenhuma organização cadastrada.</p> : empresas.map((empresa) => (
                  <article className="admin-record" key={empresa.id}>
                    <div><strong>{empresa.nome}</strong><small>{empresa.CNPJ} · {empresa.email_rep}</small></div>
                    <div className="table-actions">
                      <button className="text-action" onClick={() => {
                        setEmpresaEmEdicao(empresa);
                        setFormularioEmpresa({ nome: empresa.nome, email_rep: empresa.email_rep, CNPJ: empresa.CNPJ, descricao: empresa.descricao });
                      }} type="button">Editar</button>
                      <button className="text-action text-danger" onClick={() => excluirEmpresa(empresa)} type="button">Excluir</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="admin-section">
              <div className="admin-section-heading">
                <h3>{usuarioEmEdicao ? 'Editar investidor' : 'Cadastrar investidor'}</h3>
                {usuarioEmEdicao && (
                  <button
                    className="quiet-button"
                    onClick={() => {
                      setUsuarioEmEdicao(null);
                      setFormularioUsuario({ nome: '', email: '', CPF: '', CNPJ: '', senha: '' });
                    }}
                    type="button"
                  >
                    Cancelar
                  </button>
                )}
              </div>
              <form className="admin-form" onSubmit={salvarUsuario}>
                <label className="form-field">Nome do investidor <span>*</span>
                  <input maxLength="255" onChange={(evento) => setFormularioUsuario({ ...formularioUsuario, nome: evento.target.value })} required value={formularioUsuario.nome} />
                </label>
                <label className="form-field">E-mail <span>*</span>
                  <input onChange={(evento) => setFormularioUsuario({ ...formularioUsuario, email: evento.target.value })} required type="email" value={formularioUsuario.email} />
                </label>
                <label className="form-field">CPF <span>*</span>
                  <input maxLength="14" onChange={(evento) => setFormularioUsuario({ ...formularioUsuario, CPF: evento.target.value })} placeholder="11 dígitos" required value={formularioUsuario.CPF} />
                </label>
                <label className="form-field">CNPJ (opcional)
                  <input maxLength="18" onChange={(evento) => setFormularioUsuario({ ...formularioUsuario, CNPJ: evento.target.value })} placeholder="14 dígitos" value={formularioUsuario.CNPJ} />
                </label>
                <label className="form-field form-wide">
                  {usuarioEmEdicao ? 'Nova senha (opcional)' : 'Senha *'}
                  <input autoComplete="new-password" minLength="8" onChange={(evento) => setFormularioUsuario({ ...formularioUsuario, senha: evento.target.value })} required={!usuarioEmEdicao} type="password" value={formularioUsuario.senha} />
                </label>
                <p className="form-guidance form-wide">A senha é armazenada com hash e nunca é exibida na listagem. Deixe vazia ao editar para mantê-la.</p>
                <button className="primary-button admin-submit" disabled={salvandoCadastro} type="submit">
                  {salvandoCadastro ? 'Salvando...' : usuarioEmEdicao ? 'Salvar usuário' : 'Cadastrar usuário'}
                </button>
              </form>
              <div className="admin-records">
                {usuarios.length === 0 ? <p className="admin-empty">Nenhum investidor cadastrado.</p> : usuarios.map((usuario) => (
                  <article className="admin-record" key={usuario.id}>
                    <div><strong>{usuario.nome}</strong><small>{usuario.email} · CPF {usuario.CPF}</small></div>
                    <div className="table-actions">
                      <button className="text-action" onClick={() => {
                        setUsuarioEmEdicao(usuario);
                        setFormularioUsuario({ nome: usuario.nome, email: usuario.email, CPF: usuario.CPF, CNPJ: usuario.CNPJ || '', senha: '' });
                      }} type="button">Editar</button>
                      <button className="text-action text-danger" onClick={() => excluirUsuario(usuario)} type="button">Excluir</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>

        <footer className="page-footer">
          Índice <span>·</span> Acompanhamento demonstrativo de ações, criptoativos e mercado financeiro.
        </footer>
      </div>
    </main>
  );
}
