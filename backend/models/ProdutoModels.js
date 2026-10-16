export function criarProdutoModel({pool}){
    async function listarTodos(){
        const [linhas] = await pool.query('SELECT * FROM produtos_livres');
        return linhas.map(p=> ({...p, preco: Number(p.preco)}));
    }
    async function buscarPorId(id) {
        const [linhas] = await pool.query(`SELECT * FROM produtos_livres WHERE ID = ?`, [id]);
        if (linhas.length === 0) return null;
        return {...linhas[0], preco: Number(linhas[0].preco)};
    }
    async function criar(produto) {
        const sql = 'INSERT INTO produtos_livres (nome, preco, estoque, categoria) VALUES (?,?,?,?)';
        const valores = [produto.nome, produto.preco, produto.estoque, produto.categoria];
        const [resultado] = await pool.query(sql, valores)
        return {...produto, id:resultado.insertId};
    }
    return{listarTodos, buscarPorId, criar};
}