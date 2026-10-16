export function criarProdutoController({produtoService}) {
    async function listar(req, res, next) {
        try {
            const produto = await produtoService.listar();
            res.status(200).json({ sucesso: true, dados: produto });
        }
        catch (erro){
            next(erro);
        }
    }
    async function buscar(req,res,next){
        try {
            const produto = await produtoService.buscarPorId(req.params.id)
            res.status(200).json({sucesso: true, dados: produto});
        } catch (erro) {
            if(erro instanceof TypeError) return res.status(400).json({erro: erro.message});
            if(erro.message.includes('não econtrado')) return res.status(404).json({erro: erro.message});
            next(erro);
        }
    }
    async function criar(req, res, next) {
        try {
            const produtoNovo = await produtoService.criar(req.body);
            res.status(201).json({sucesso: true, dados: produtoNovo});
        } catch(erro) {
            res.status(400).json({sucesso: false,erro:erro.message})
        }
    }
    return {listar, buscar, criar}
}