import Produto from "../models/Produto.js"

export function criarProdutoService({produtoModel}){
    async function listar(){
        return produtoModel.listarTodos();
    }
    async function buscarPorId(idRecebido){
        const id = Number(idRecebido);
        if(!Number.isInteger(id)|| id<=0){
            throw new TypeError('ID deve ser um número inteiro positivo');
        }
        const produto = await produtoModel.buscarPorId(id);
        if(!produto) throw new Error(`Produto ${id} não encontrado`);
        return produto;
    }
    async function criar(dados) {
        const produto = new Produto({id:1,...dados});
        return produtoModel.criar({
            nome:produto.nome,
            preco:produto.preco,
            estoque:produto.estoque,
            categoria:produto.categoria
        });
    }
    return {listar, buscarPorId, criar}
}