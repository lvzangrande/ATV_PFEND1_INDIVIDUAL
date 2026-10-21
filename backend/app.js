import cors from 'cors';
import express from 'express';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { criarPool } from './config/database.js';

const categorias = {
  NEGOCIAVEL: [
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
  ],
  MONITORADO: [
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
  ],
};

export function criarApp({ pool = criarPool() } = {}) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  async function listarAtivos() {
    const [linhas] = await pool.query(`
      SELECT ID AS id, nome, categoria, preco, descricao, posicao, 'NEGOCIAVEL' AS status
      FROM ativos_negociaveis
      UNION ALL
      SELECT ID AS id, nome, categoria, preco, descricao, posicao, 'MONITORADO' AS status
      FROM ativos_monitorados
      ORDER BY nome
    `);
    return linhas.map((ativo) => ({
      ...ativo,
      id: Number(ativo.id),
      preco: ativo.preco === null ? null : Number(ativo.preco),
      posicao: Number(ativo.posicao),
    }));
  }

  function validarAtivo(dados) {
    const erros = {};
    if (typeof dados.nome !== 'string' || !dados.nome.trim() || dados.nome.length > 255) {
      erros.nome = 'Informe um nome de até 255 caracteres.';
    }
    if (!Object.hasOwn(categorias, dados.status)) {
      erros.status = 'Selecione um status de ativo válido.';
    } else if (!categorias[dados.status].includes(dados.categoria)) {
      erros.categoria = 'Selecione uma classe compatível com o status do ativo.';
    }
    if (!Number.isSafeInteger(dados.posicao) || dados.posicao < 0 || dados.posicao > 2147483647) {
      erros.posicao = 'A posição deve ser um número inteiro maior ou igual a zero.';
    }
    if (typeof dados.descricao !== 'string' || dados.descricao.length > 255) {
      erros.descricao = 'A descrição deve ter até 255 caracteres.';
    }
    const precoValido = typeof dados.preco === 'number'
      && Number.isFinite(dados.preco)
      && dados.preco >= 0
      && dados.preco <= 99999999.99
      && Math.abs(dados.preco - Number(dados.preco.toFixed(2))) < 1e-8;
    if (dados.preco !== null && dados.preco !== undefined
      && !precoValido) {
      erros.preco = 'O preço deve ter até duas casas decimais e ser menor ou igual a R$ 99.999.999,99.';
    }
    return erros;
  }

  function tabelaDoStatus(status) {
    return status === 'NEGOCIAVEL' ? 'ativos_negociaveis' : 'ativos_monitorados';
  }

  function validarEmpresa(dados) {
    const erros = {};
    if (typeof dados.nome !== 'string' || !dados.nome.trim() || dados.nome.length > 255) {
      erros.nome = 'Informe o nome da empresa.';
    }
    if (typeof dados.email_rep !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email_rep)) {
      erros.email_rep = 'Informe um e-mail válido para o representante.';
    }
    if (typeof dados.CNPJ !== 'string' || dados.CNPJ.replace(/\D/g, '').length !== 14) {
      erros.CNPJ = 'Informe um CNPJ com 14 dígitos.';
    }
    if (typeof dados.descricao !== 'string' || dados.descricao.length > 255) {
      erros.descricao = 'A descrição deve ter até 255 caracteres.';
    }
    return erros;
  }

  function validarUsuario(dados, exigirSenha) {
    const erros = {};
    if (typeof dados.nome !== 'string' || !dados.nome.trim() || dados.nome.length > 255) {
      erros.nome = 'Informe o nome do usuário.';
    }
    if (typeof dados.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      erros.email = 'Informe um e-mail válido.';
    }
    if (typeof dados.CPF !== 'string' || dados.CPF.replace(/\D/g, '').length !== 11) {
      erros.CPF = 'Informe um CPF com 11 dígitos.';
    }
    if (dados.CNPJ && (typeof dados.CNPJ !== 'string' || dados.CNPJ.replace(/\D/g, '').length !== 14)) {
      erros.CNPJ = 'Se informado, o CNPJ deve conter 14 dígitos.';
    }
    if (exigirSenha && (typeof dados.senha !== 'string' || dados.senha.length < 8)) {
      erros.senha = 'A senha deve ter pelo menos 8 caracteres.';
    } else if (dados.senha && dados.senha.length < 8) {
      erros.senha = 'A nova senha deve ter pelo menos 8 caracteres.';
    }
    return erros;
  }

  function cpfOuCnpjNormalizado(valor) {
    return valor ? valor.replace(/\D/g, '') : null;
  }

  app.get('/api/status', async (_req, res) => {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', banco: 'conectado' });
  });

  app.get('/api/dashboard', async (_req, res) => {
    const [ativos] = await pool.query(`
      SELECT COUNT(*) AS quantidade, COALESCE(SUM(posicao), 0) AS unidades
      FROM (
        SELECT posicao FROM ativos_negociaveis
        UNION ALL
        SELECT posicao FROM ativos_monitorados
      ) AS posicoes
    `);
    const [vendas] = await pool.query(`
      SELECT COUNT(*) AS quantidade, COALESCE(SUM(quantidade * preco_unitario), 0) AS total
      FROM vendas
    `);
    const [empresas] = await pool.query('SELECT COUNT(*) AS quantidade FROM empresas');
    const [usuarios] = await pool.query('SELECT COUNT(*) AS quantidade FROM usuarios');
    res.status(200).json({
      produtos: Number(ativos[0].quantidade),
      unidades: Number(ativos[0].unidades),
      vendas: Number(vendas[0].quantidade),
      totalVendido: Number(vendas[0].total),
      empresas: Number(empresas[0].quantidade),
      usuarios: Number(usuarios[0].quantidade),
    });
  });

  app.get('/api/ativos', async (_req, res) => {
    res.status(200).json(await listarAtivos());
  });

  app.get('/api/ativos/:status/:id', async (req, res) => {
    const { status } = req.params;
    const id = Number(req.params.id);
    if (!Object.hasOwn(categorias, status) || !Number.isSafeInteger(id) || id < 1 || id > 2147483647) {
      return res.status(400).json({ erro: 'Status ou identificador de ativo inválido.' });
    }
    const [linhas] = await pool.execute(
      `SELECT ID AS id, nome, categoria, preco, descricao, posicao FROM ${tabelaDoStatus(status)} WHERE ID = ?`,
      [id],
    );
    if (linhas.length === 0) return res.status(404).json({ erro: 'Ativo não encontrado.' });
    return res.status(200).json({
      ...linhas[0],
      id: Number(linhas[0].id),
      preco: linhas[0].preco === null ? null : Number(linhas[0].preco),
      posicao: Number(linhas[0].posicao),
      status,
    });
  });

  app.post('/api/ativos', async (req, res) => {
    const dados = req.body || {};
    const erros = validarAtivo(dados);
    if (Object.keys(erros).length > 0) {
      return res.status(400).json({ erro: 'Verifique os dados do ativo.', campos: erros });
    }
    const tabela = tabelaDoStatus(dados.status);
    const [resultado] = await pool.execute(
      `INSERT INTO ${tabela} (nome, categoria, preco, descricao, posicao) VALUES (?, ?, ?, ?, ?)`,
      [dados.nome.trim(), dados.categoria, dados.preco ?? null, dados.descricao, dados.posicao],
    );
    const [linhas] = await pool.execute(
      `SELECT ID AS id, nome, categoria, preco, descricao, posicao FROM ${tabela} WHERE ID = ?`,
      [resultado.insertId],
    );
    return res.status(201).json({
      ...linhas[0],
      id: Number(linhas[0].id),
      preco: linhas[0].preco === null ? null : Number(linhas[0].preco),
      posicao: Number(linhas[0].posicao),
      status: dados.status,
    });
  });

  app.put('/api/ativos/:status/:id', async (req, res) => {
    const { status } = req.params;
    const id = Number(req.params.id);
    if (!Object.hasOwn(categorias, status) || !Number.isSafeInteger(id) || id < 1 || id > 2147483647) {
      return res.status(400).json({ erro: 'Status ou identificador de ativo inválido.' });
    }
    const dados = req.body || {};
    const erros = validarAtivo({ ...dados, status });
    if (Object.keys(erros).length > 0) {
      return res.status(400).json({ erro: 'Verifique os dados do ativo.', campos: erros });
    }
    const tabela = tabelaDoStatus(status);
    const [resultado] = await pool.execute(
      `UPDATE ${tabela} SET nome = ?, categoria = ?, preco = ?, descricao = ?, posicao = ? WHERE ID = ?`,
      [dados.nome.trim(), dados.categoria, dados.preco ?? null, dados.descricao, dados.posicao, id],
    );
    if (resultado.affectedRows === 0) {
      const [existente] = await pool.execute(`SELECT ID FROM ${tabela} WHERE ID = ?`, [id]);
      if (existente.length === 0) return res.status(404).json({ erro: 'Ativo não encontrado.' });
    }
    const [linhas] = await pool.execute(
      `SELECT ID AS id, nome, categoria, preco, descricao, posicao FROM ${tabela} WHERE ID = ?`,
      [id],
    );
    return res.status(200).json({
      ...linhas[0],
      id: Number(linhas[0].id),
      preco: linhas[0].preco === null ? null : Number(linhas[0].preco),
      posicao: Number(linhas[0].posicao),
      status,
    });
  });

  app.delete('/api/ativos/:status/:id', async (req, res) => {
    const { status } = req.params;
    const id = Number(req.params.id);
    if (!Object.hasOwn(categorias, status) || !Number.isSafeInteger(id) || id < 1 || id > 2147483647) {
      return res.status(400).json({ erro: 'Status ou identificador de ativo inválido.' });
    }
    const [resultado] = await pool.execute(`DELETE FROM ${tabelaDoStatus(status)} WHERE ID = ?`, [id]);
    if (resultado.affectedRows === 0) return res.status(404).json({ erro: 'Ativo não encontrado.' });
    return res.status(200).json({ mensagem: 'Ativo removido com sucesso.' });
  });

  app.get('/api/empresas', async (_req, res) => {
    const [empresas] = await pool.query(
      'SELECT ID AS id, nome, email_rep, CNPJ, descricao FROM empresas ORDER BY nome',
    );
    res.status(200).json(empresas);
  });

  app.post('/api/empresas', async (req, res) => {
    const dados = req.body || {};
    const erros = validarEmpresa(dados);
    if (Object.keys(erros).length > 0) {
      return res.status(400).json({ erro: 'Verifique os dados da empresa.', campos: erros });
    }
    const [resultado] = await pool.execute(
      'INSERT INTO empresas (nome, email_rep, CNPJ, descricao) VALUES (?, ?, ?, ?)',
      [dados.nome.trim(), dados.email_rep.trim(), cpfOuCnpjNormalizado(dados.CNPJ), dados.descricao],
    );
    return res.status(201).json({
      id: Number(resultado.insertId),
      nome: dados.nome.trim(),
      email_rep: dados.email_rep.trim(),
      CNPJ: cpfOuCnpjNormalizado(dados.CNPJ),
      descricao: dados.descricao,
    });
  });

  app.put('/api/empresas/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1 || id > 2147483647) {
      return res.status(400).json({ erro: 'Identificador de empresa inválido.' });
    }
    const dados = req.body || {};
    const erros = validarEmpresa(dados);
    if (Object.keys(erros).length > 0) {
      return res.status(400).json({ erro: 'Verifique os dados da empresa.', campos: erros });
    }
    const [resultado] = await pool.execute(
      'UPDATE empresas SET nome = ?, email_rep = ?, CNPJ = ?, descricao = ? WHERE ID = ?',
      [dados.nome.trim(), dados.email_rep.trim(), cpfOuCnpjNormalizado(dados.CNPJ), dados.descricao, id],
    );
    if (resultado.affectedRows === 0) {
      const [existente] = await pool.execute('SELECT ID FROM empresas WHERE ID = ?', [id]);
      if (existente.length === 0) return res.status(404).json({ erro: 'Empresa não encontrada.' });
    }
    return res.status(200).json({
      id,
      nome: dados.nome.trim(),
      email_rep: dados.email_rep.trim(),
      CNPJ: cpfOuCnpjNormalizado(dados.CNPJ),
      descricao: dados.descricao,
    });
  });

  app.delete('/api/empresas/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1 || id > 2147483647) {
      return res.status(400).json({ erro: 'Identificador de empresa inválido.' });
    }
    const [resultado] = await pool.execute('DELETE FROM empresas WHERE ID = ?', [id]);
    if (resultado.affectedRows === 0) return res.status(404).json({ erro: 'Empresa não encontrada.' });
    return res.status(200).json({ mensagem: 'Empresa excluída com sucesso.' });
  });

  app.get('/api/usuarios', async (_req, res) => {
    const [usuarios] = await pool.query(
      'SELECT ID AS id, nome, email, CPF, CNPJ FROM usuarios ORDER BY nome',
    );
    res.status(200).json(usuarios.map((usuario) => ({
      ...usuario,
      id: Number(usuario.id),
    })));
  });

  app.post('/api/usuarios', async (req, res) => {
    const dados = req.body || {};
    const erros = validarUsuario(dados, true);
    if (Object.keys(erros).length > 0) {
      return res.status(400).json({ erro: 'Verifique os dados do usuário.', campos: erros });
    }
    const hashSenha = await bcrypt.hash(dados.senha, 12);
    const [resultado] = await pool.execute(
      'INSERT INTO usuarios (nome, email, senha, CPF, CNPJ) VALUES (?, ?, ?, ?, ?)',
      [
        dados.nome.trim(),
        dados.email.trim(),
        hashSenha,
        cpfOuCnpjNormalizado(dados.CPF),
        cpfOuCnpjNormalizado(dados.CNPJ),
      ],
    );
    return res.status(201).json({
      id: Number(resultado.insertId),
      nome: dados.nome.trim(),
      email: dados.email.trim(),
      CPF: cpfOuCnpjNormalizado(dados.CPF),
      CNPJ: cpfOuCnpjNormalizado(dados.CNPJ),
    });
  });

  app.put('/api/usuarios/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1 || id > 2147483647) {
      return res.status(400).json({ erro: 'Identificador de usuário inválido.' });
    }
    const dados = req.body || {};
    const erros = validarUsuario(dados, false);
    if (Object.keys(erros).length > 0) {
      return res.status(400).json({ erro: 'Verifique os dados do usuário.', campos: erros });
    }
    const campos = [
      dados.nome.trim(),
      dados.email.trim(),
      cpfOuCnpjNormalizado(dados.CPF),
      cpfOuCnpjNormalizado(dados.CNPJ),
    ];
    let resultado;
    if (dados.senha) {
      const hashSenha = await bcrypt.hash(dados.senha, 12);
      [resultado] = await pool.execute(
        'UPDATE usuarios SET nome = ?, email = ?, CPF = ?, CNPJ = ?, senha = ? WHERE ID = ?',
        [...campos, hashSenha, id],
      );
    } else {
      [resultado] = await pool.execute(
        'UPDATE usuarios SET nome = ?, email = ?, CPF = ?, CNPJ = ? WHERE ID = ?',
        [...campos, id],
      );
    }
    if (resultado.affectedRows === 0) {
      const [existente] = await pool.execute('SELECT ID FROM usuarios WHERE ID = ?', [id]);
      if (existente.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    return res.status(200).json({
      id,
      nome: dados.nome.trim(),
      email: dados.email.trim(),
      CPF: cpfOuCnpjNormalizado(dados.CPF),
      CNPJ: cpfOuCnpjNormalizado(dados.CNPJ),
    });
  });

  app.delete('/api/usuarios/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1 || id > 2147483647) {
      return res.status(400).json({ erro: 'Identificador de usuário inválido.' });
    }
    const [resultado] = await pool.execute('DELETE FROM usuarios WHERE ID = ?', [id]);
    if (resultado.affectedRows === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    return res.status(200).json({ mensagem: 'Usuário excluído com sucesso.' });
  });

  app.get('/api/vendas', async (_req, res) => {
    const [linhas] = await pool.query(`
      SELECT v.ID AS id, v.codigo_venda AS codigo, a.nome AS ativo,
        v.quantidade, v.preco_unitario AS preco, v.data_venda AS data,
        v.empresa_ID AS empresaId, e.nome AS empresa
      FROM vendas AS v
      INNER JOIN ativos_negociaveis AS a ON a.ID = v.ativo_ID
      LEFT JOIN empresas AS e ON e.ID = v.empresa_ID
      ORDER BY v.data_venda DESC, v.ID DESC
      LIMIT 20
    `);
    res.status(200).json(linhas.map((venda) => ({
      ...venda,
      id: Number(venda.id),
      quantidade: Number(venda.quantidade),
      preco: Number(venda.preco),
      total: Number(venda.preco) * Number(venda.quantidade),
      empresaId: venda.empresaId === null ? null : Number(venda.empresaId),
    })));
  });

  app.post('/api/vendas', async (req, res) => {
    const ativoId = Number(req.body?.ativoId);
    const quantidade = req.body?.quantidade;
    const empresaId = req.body?.empresaId === null || req.body?.empresaId === undefined || req.body.empresaId === ''
      ? null
      : Number(req.body.empresaId);
    if (req.body?.status !== 'NEGOCIAVEL'
      || !Number.isSafeInteger(ativoId) || ativoId < 1
      || ativoId > 2147483647
      || !Number.isSafeInteger(quantidade) || quantidade < 1 || quantidade > 2147483647
      || (empresaId !== null && (!Number.isSafeInteger(empresaId) || empresaId < 1 || empresaId > 2147483647))) {
      return res.status(400).json({ erro: 'Selecione um ativo negociável e uma quantidade inteira maior que zero.' });
    }

    const conexao = await pool.getConnection();
    try {
      await conexao.beginTransaction();
      const [ativos] = await conexao.execute(
        'SELECT ID AS id, nome, preco, posicao FROM ativos_negociaveis WHERE ID = ? FOR UPDATE',
        [ativoId],
      );
      if (ativos.length === 0) {
        await conexao.rollback();
        return res.status(404).json({ erro: 'Ativo negociável não encontrado.' });
      }
      const ativo = ativos[0];
      let empresa = null;
      if (empresaId !== null) {
        const [empresas] = await conexao.execute('SELECT ID, nome FROM empresas WHERE ID = ? FOR UPDATE', [empresaId]);
        if (empresas.length === 0) {
          await conexao.rollback();
          return res.status(404).json({ erro: 'Empresa selecionada não encontrada.' });
        }
        empresa = empresas[0];
      }
      if (ativo.preco === null) {
        await conexao.rollback();
        return res.status(400).json({ erro: 'Defina o preço do ativo antes de registrar a venda.' });
      }
      if (Number(ativo.posicao) < quantidade) {
        await conexao.rollback();
        return res.status(409).json({ erro: `Posição insuficiente. Disponível: ${ativo.posicao}.` });
      }

      const codigo = `V-${randomUUID()}`;
      const [venda] = await conexao.execute(
        'INSERT INTO vendas (codigo_venda, ativo_ID, empresa_ID, quantidade, preco_unitario) VALUES (?, ?, ?, ?, ?)',
        [codigo, ativoId, empresaId, quantidade, ativo.preco],
      );
      await conexao.execute(
        'UPDATE ativos_negociaveis SET posicao = posicao - ? WHERE ID = ?',
        [quantidade, ativoId],
      );
      await conexao.commit();
      return res.status(201).json({
        id: Number(venda.insertId),
        codigo,
        ativo: ativo.nome,
        quantidade,
        empresa: empresa?.nome || null,
        preco: Number(ativo.preco),
        total: Number(ativo.preco) * quantidade,
        mensagem: 'Venda registrada e posição atualizada.',
      });
    } catch (erro) {
      await conexao.rollback();
      throw erro;
    } finally {
      conexao.release();
    }
  });

  app.use((req, res) => {
    res.status(404).json({ erro: `A rota ${req.method} ${req.originalUrl} não existe.` });
  });

  app.use((erro, _req, res, _next) => {
    if (erro instanceof SyntaxError && erro.status === 400 && 'body' in erro) {
      return res.status(400).json({ erro: 'O corpo da requisição deve conter um JSON válido.' });
    }
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Já existe um registro com esse nome, e-mail, CPF ou CNPJ.' });
    }
    if (erro.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ erro: 'Este registro possui vendas vinculadas e não pode ser excluído.' });
    }
    console.error('Erro na API da carteira:', erro);
    return res.status(500).json({ erro: 'Falha ao acessar o banco de dados. Verifique a conexão e as migrações.' });
  });

  return app;
}

export const app = criarApp();
