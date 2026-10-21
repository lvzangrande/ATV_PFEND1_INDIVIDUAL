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

const categoriasLivres = [
  'Saneantes Domissanitários de Risco 1',
  'Saneantes Domissanitários de Risco 2 de Venda Livre',
  'Cosméticos, Produtos de Higiene Pessoal e Perfumaria',
  'Tintas Imobiliárias, Vernizes e Seladoras',
  'Adesivos e Colas de Uso Geral',
  'Lubrificantes, Graxas e Fluidos Automotivos',
  'Soluções Orgânicas Diluídas (até 60% de concentração)',
  'Eletrólitos de Bateria Automotiva (até 40% de concentração)',
  'Óleos Essenciais e Preparações Diluídas (até 4% de concentração)',
  'Kits de Química Educacional e Didática',
];

const categoriasControladas = [
  'Produtos Controlados pela Polícia Federal',
  'Produtos Controlados pelo Exército Brasileiro',
  'Produtos Controlados pela Polícia Civil',
  'Saneantes e Desinfetantes de Uso Hospitalar',
  'Saneantes Restritos ao Uso Profissional',
  'Precursores de Entorpecentes e Psicotrópicos',
  'Precursores de Explosivos',
  'Armas Químicas e Insumos Relacionados',
  'Agrotóxicos e Defensivos Agrícolas Rígidos',
  'Substâncias Químicas Puras e Solventes Concentrados',
];

const formularioInicial = {
  nome: '',
  tipo: 'LIVRE',
  categoria: '',
  preco: '',
  descricao: '',
  estoque: '',
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
    (produto) => produto.tipo === 'LIVRE' && produto.estoque > 0 && produto.preco !== null,
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
      setErro('');
    } catch (falha) {
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
      ...(name === 'tipo' ? { categoria: '' } : {}),
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
    const categoriaValida = formulario.tipo === 'LIVRE' ? categoriasLivres : categoriasControladas;
    const preco = formulario.preco === '' ? null : Number(formulario.preco);
    const estoque = Number(formulario.estoque);

    if (!formulario.nome.trim()) {
      setErro('Informe o nome do produto.');
      return;
    }
    if (!categoriaValida.includes(formulario.categoria)) {
      setErro('Selecione uma categoria válida para o tipo de produto.');
      return;
    }
    if (!Number.isSafeInteger(estoque) || estoque < 0) {
      setErro('O estoque deve ser um número inteiro igual ou maior que zero.');
      return;
    }
    if (formulario.tipo === 'CONTROLADO' && (preco === null || !Number.isFinite(preco) || preco < 0)) {
      setErro('Informe um preço válido para produtos controlados.');
      return;
    }
    if (preco !== null && (!Number.isFinite(preco) || preco < 0)) {
      setErro('O preço deve ser um número igual ou maior que zero.');
      return;
    }

    const dados = {
      nome: formulario.nome.trim(),
      tipo: formulario.tipo,
      categoria: formulario.categoria,
      preco,
      descricao: formulario.descricao.trim(),
      estoque,
    };

    setSalvando(true);
    setErro('');
    setAviso('');
    try {
      if (produtoEmEdicao) {
        await atualizarProduto({ ...dados, id: produtoEmEdicao.id, tipo: produtoEmEdicao.tipo });
        setAviso('Produto atualizado no banco de dados.');
      } else {
        await criarProduto(dados);
        setAviso('Produto cadastrado no banco de dados.');
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
      tipo: produto.tipo,
      categoria: produto.categoria,
      preco: produto.preco === null ? '' : String(produto.preco),
      descricao: produto.descricao,
      estoque: String(produto.estoque),
    });
    setErro('');
    setAviso('');
    document.getElementById('form-produto')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function excluirProduto(produto) {
    if (!window.confirm(`Excluir "${produto.nome}" do banco de dados?`)) return;
    setErro('');
    setAviso('');
    try {
      await removerProduto(produto);
      if (produtoEmEdicao?.id === produto.id && produtoEmEdicao.tipo === produto.tipo) limparFormulario();
      setAviso('Produto excluído do banco de dados.');
      await atualizarPainel();
    } catch (falha) {
      setErro(falha.message);
    }
  }

  async function registrarVenda(evento) {
    evento.preventDefault();
    const produto = produtos.find((item) => item.tipo === 'LIVRE' && item.id === Number(produtoDaVenda));
    const quantidade = Number(quantidadeVenda);

    if (!produto || produto.tipo !== 'LIVRE' || produto.preco === null) {
      setErro('Selecione um produto de venda livre com preço definido.');
      return;
    }
    if (!Number.isSafeInteger(quantidade) || quantidade < 1) {
      setErro('Informe uma quantidade inteira maior que zero.');
      return;
    }
    if (quantidade > produto.estoque) {
      setErro(`Estoque insuficiente. Disponível: ${produto.estoque}.`);
      return;
    }

    setAviso('');
    setRegistrandoVenda(true);
    try {
      await criarVenda(
        produto.id,
        produto.tipo,
        quantidade,
        empresaDaVenda ? Number(empresaDaVenda) : null,
      );
      setAviso('');
      setQuantidadeVenda('1');
      setAviso('Venda registrada no banco de dados e estoque atualizado.');
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
        setAviso('Empresa atualizada no banco de dados.');
      } else {
        await criarEmpresa(formularioEmpresa);
        setAviso('Empresa cadastrada no banco de dados.');
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
        setAviso('Usuário atualizado no banco de dados.');
      } else {
        await criarUsuario(formularioUsuario);
        setAviso('Usuário cadastrado no banco de dados.');
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
    if (!window.confirm(`Excluir a empresa "${empresa.nome}"?`)) return;
    setErro('');
    setAviso('');
    try {
      await removerEmpresa(empresa.id);
      if (empresaEmEdicao?.id === empresa.id) {
        setEmpresaEmEdicao(null);
        setFormularioEmpresa({ nome: '', email_rep: '', CNPJ: '', descricao: '' });
      }
      setAviso('Empresa excluída do banco de dados.');
      await atualizarPainel();
    } catch (falha) {
      setErro(falha.message);
    }
  }

  async function excluirUsuario(usuario) {
    if (!window.confirm(`Excluir o usuário "${usuario.nome}"?`)) return;
    setErro('');
    setAviso('');
    try {
      await removerUsuario(usuario.id);
      if (usuarioEmEdicao?.id === usuario.id) {
        setUsuarioEmEdicao(null);
        setFormularioUsuario({ nome: '', email: '', CPF: '', CNPJ: '', senha: '' });
      }
      setAviso('Usuário excluído do banco de dados.');
      await atualizarPainel();
    } catch (falha) {
      setErro(falha.message);
    }
  }

  return (
    <main>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#" aria-label="Química Comercial, início">
            <span className="brand-icon" aria-hidden="true">Q</span>
            <span><strong>Química</strong><small>COMERCIAL</small></span>
          </a>
          <nav className="top-nav" aria-label="Navegação principal">
            <a className="nav-active" href="#catalogo">Produtos</a>
            <a href="#vendas">Vendas</a>
            <a href="#cadastro">Cadastro</a>
            <a href="#administracao">Administração</a>
          </nav>
          <span className="topbar-note">{carregando ? 'Conectando ao banco...' : erro ? 'Banco indisponível' : 'Banco conectado'}</span>
        </div>
      </header>

      <div className="page-wrap">
        <section className="welcome">
          <div>
            <p className="overline">CONTROLE COMERCIAL</p>
            <h1>Produtos e vendas</h1>
            <p>Consulte o estoque, gerencie o catálogo e registre vendas de produtos liberados.</p>
          </div>
          <a className="primary-button" href="#cadastro">＋ Novo produto</a>
        </section>

        <section className="stats-grid" aria-label="Resumo do catálogo">
          <article className="stat-card">
            <span className="stat-icon icon-blue" aria-hidden="true">▦</span>
            <div><p>Produtos cadastrados</p><strong>{resumo.produtos}</strong></div>
          </article>
          <article className="stat-card">
            <span className="stat-icon icon-green" aria-hidden="true">✓</span>
            <div><p>Unidades em estoque</p><strong>{resumo.unidades}</strong></div>
          </article>
          <article className="stat-card">
            <span className="stat-icon icon-amber" aria-hidden="true">↗</span>
            <div><p>Vendas registradas</p><strong>{resumo.vendas}</strong></div>
          </article>
          <article className="stat-card">
            <span className="stat-icon icon-purple" aria-hidden="true">R$</span>
            <div><p>Total vendido</p><strong>{formatarMoeda(resumo.totalVendido)}</strong></div>
          </article>
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
                <div><p className="overline">CATÁLOGO</p><h2>Produtos</h2></div>
                <span className="record-count">{produtosFiltrados.length} registros</span>
              </div>

              <div className="catalog-controls">
                <div className="filter-tabs" role="group" aria-label="Filtrar por tipo">
                  {[
                    ['TODOS', 'Todos'],
                    ['LIVRE', 'Venda livre'],
                    ['CONTROLADO', 'Controlados'],
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
                    aria-label="Buscar produto"
                    onChange={(evento) => setBusca(evento.target.value)}
                    placeholder="Buscar produto..."
                    value={busca}
                  />
                </label>
              </div>

              {carregando ? (
                <div className="empty-state"><strong>Consultando produtos no banco...</strong></div>
              ) : produtosFiltrados.length === 0 ? (
                <div className="empty-state">
                  <span aria-hidden="true">▧</span>
                  <strong>Nenhum produto encontrado</strong>
                  <p>Cadastre um produto ou ajuste os filtros da busca.</p>
                </div>
              ) : (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Tipo</th>
                        <th>Preço</th>
                        <th>Estoque</th>
                        <th><span className="visually-hidden">Ações</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {produtosFiltrados.map((produto) => (
                        <tr key={`${produto.tipo}-${produto.id}`}>
                          <td>
                            <strong className="product-name">{produto.nome}</strong>
                            <span className="product-description">{produto.descricao || 'Sem descrição'}</span>
                          </td>
                          <td className="category-cell">{produto.categoria}</td>
                          <td><span className={`type-badge ${produto.tipo === 'LIVRE' ? 'type-free' : 'type-controlled'}`}>
                            {produto.tipo === 'LIVRE' ? 'Venda livre' : 'Controlado'}
                          </span></td>
                          <td className="price-cell">{formatarMoeda(produto.preco)}</td>
                          <td><span className={`stock-value ${produto.estoque < 10 ? 'stock-low' : ''}`}>{produto.estoque}</span></td>
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
              <p className="panel-footnote">Catálogo consultado nas tabelas produtos_LIVRES e produtos_NAO_LIVRES.</p>
            </section>

            <section className="panel" id="cadastro">
              <div className="panel-heading">
                <div><p className="overline">CATÁLOGO</p><h2>{produtoEmEdicao ? 'Editar produto' : 'Cadastrar produto'}</h2></div>
                {produtoEmEdicao && <button className="quiet-button" onClick={limparFormulario} type="button">Cancelar edição</button>}
              </div>
              <form className="product-form" onSubmit={salvarProduto}>
                <label className="form-field">
                  Nome do produto <span>*</span>
                  <input maxLength="255" name="nome" onChange={alterarCampo} required value={formulario.nome} disabled={salvando} />
                </label>
                <label className="form-field">
                  Tipo de produto <span>*</span>
                  <select name="tipo" onChange={alterarCampo} value={formulario.tipo} disabled={salvando || Boolean(produtoEmEdicao)}>
                    <option value="LIVRE">Produto livre</option>
                    <option value="CONTROLADO">Produto controlado</option>
                  </select>
                </label>
                <label className="form-field form-wide">
                  Categoria <span>*</span>
                  <select name="categoria" onChange={alterarCampo} required value={formulario.categoria} disabled={salvando}>
                    <option value="">Selecione uma categoria</option>
                    {(formulario.tipo === 'LIVRE' ? categoriasLivres : categoriasControladas).map((categoria) => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  Preço (R$) {formulario.tipo === 'CONTROLADO' && <span>*</span>}
                  <input min="0" name="preco" onChange={alterarCampo} placeholder="0,00" step="0.01" type="number" value={formulario.preco} disabled={salvando} />
                </label>
                <label className="form-field">
                  Estoque <span>*</span>
                  <input min="0" name="estoque" onChange={alterarCampo} required step="1" type="number" value={formulario.estoque} disabled={salvando} />
                </label>
                <label className="form-field form-wide">
                  Descrição
                  <textarea maxLength="255" name="descricao" onChange={alterarCampo} rows="2" value={formulario.descricao} disabled={salvando} />
                </label>
                {formulario.tipo === 'CONTROLADO' && (
                  <p className="form-guidance form-wide">
                    Produtos controlados exigem conferência das autorizações aplicáveis. Esta demonstração não registra vendas dessa categoria.
                  </p>
                )}
                <div className="form-actions form-wide">
                  <button className="secondary-button" onClick={limparFormulario} type="button" disabled={salvando}>Limpar</button>
                  <button className="primary-button" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : produtoEmEdicao ? 'Salvar alterações' : 'Cadastrar produto'}</button>
                </div>
              </form>
            </section>
          </div>

          <aside className="side-column">
            <section className="panel" id="vendas">
              <div className="panel-heading">
                <div><p className="overline">OPERAÇÃO</p><h2>Registrar venda</h2></div>
                <span className="sale-icon" aria-hidden="true">↗</span>
              </div>
              <p className="helper-copy">Registre a saída de produtos livres e atualize o estoque.</p>
              <form className="sale-form" onSubmit={registrarVenda}>
                <label className="form-field">
                  Produto
                  <select onChange={(evento) => setProdutoDaVenda(evento.target.value)} value={produtoDaVenda} disabled={registrandoVenda}>
                    <option value="">Selecione um produto</option>
                    {produtosParaVenda.map((produto) => (
                      <option key={produto.id} value={produto.id}>{produto.nome} — {formatarMoeda(produto.preco)}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  Quantidade
                  <input min="1" onChange={(evento) => setQuantidadeVenda(evento.target.value)} step="1" type="number" value={quantidadeVenda} disabled={registrandoVenda} />
                </label>
                <label className="form-field">
                  Empresa (opcional)
                  <select onChange={(evento) => setEmpresaDaVenda(evento.target.value)} value={empresaDaVenda} disabled={registrandoVenda}>
                    <option value="">Venda sem empresa vinculada</option>
                    {empresas.map((empresa) => (
                      <option key={empresa.id} value={empresa.id}>{empresa.nome}</option>
                    ))}
                  </select>
                </label>
                <button className="primary-button full-button" disabled={produtosParaVenda.length === 0 || registrandoVenda} type="submit">
                  {registrandoVenda ? 'Registrando...' : 'Registrar venda'}
                </button>
              </form>
              <p className="form-guidance">A venda é gravada no banco e o estoque é abatido em uma única transação. Esta tela registra somente vendas de produtos livres.</p>
            </section>

            <section className="panel sales-panel">
              <div className="panel-heading">
                <div><p className="overline">MOVIMENTAÇÃO</p><h2>Vendas recentes</h2></div>
                <span className="record-count">{vendas.length}</span>
              </div>
              {vendas.length === 0 ? (
                <p className="sales-empty">As vendas feitas nesta sessão aparecerão aqui.</p>
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
            <div><p className="overline">ADMINISTRAÇÃO</p><h2>Empresas e usuários</h2></div>
            <span className="record-count">{empresas.length} empresas · {usuarios.length} usuários</span>
          </div>

          <div className="admin-grid">
            <section className="admin-section">
              <div className="admin-section-heading">
                <h3>{empresaEmEdicao ? 'Editar empresa' : 'Cadastrar empresa'}</h3>
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
                <label className="form-field">Nome da empresa <span>*</span>
                  <input maxLength="255" onChange={(evento) => setFormularioEmpresa({ ...formularioEmpresa, nome: evento.target.value })} required value={formularioEmpresa.nome} />
                </label>
                <label className="form-field">E-mail do representante <span>*</span>
                  <input onChange={(evento) => setFormularioEmpresa({ ...formularioEmpresa, email_rep: evento.target.value })} required type="email" value={formularioEmpresa.email_rep} />
                </label>
                <label className="form-field">CNPJ <span>*</span>
                  <input maxLength="18" onChange={(evento) => setFormularioEmpresa({ ...formularioEmpresa, CNPJ: evento.target.value })} placeholder="Somente 14 dígitos" required value={formularioEmpresa.CNPJ} />
                </label>
                <label className="form-field">Descrição <span>*</span>
                  <input maxLength="255" onChange={(evento) => setFormularioEmpresa({ ...formularioEmpresa, descricao: evento.target.value })} required value={formularioEmpresa.descricao} />
                </label>
                <button className="primary-button admin-submit" disabled={salvandoCadastro} type="submit">
                  {salvandoCadastro ? 'Salvando...' : empresaEmEdicao ? 'Salvar empresa' : 'Cadastrar empresa'}
                </button>
              </form>
              <div className="admin-records">
                {empresas.length === 0 ? <p className="admin-empty">Nenhuma empresa cadastrada.</p> : empresas.map((empresa) => (
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
                <h3>{usuarioEmEdicao ? 'Editar usuário' : 'Cadastrar usuário'}</h3>
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
                <label className="form-field">Nome <span>*</span>
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
                {usuarios.length === 0 ? <p className="admin-empty">Nenhum usuário cadastrado.</p> : usuarios.map((usuario) => (
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
          Química Comercial <span>·</span> Produtos, estoque e vendas conectados ao MySQL.
        </footer>
      </div>
    </main>
  );
}
