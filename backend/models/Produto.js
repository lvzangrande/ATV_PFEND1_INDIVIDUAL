const categorias = [
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

export default class Produto {
    constructor({ id, nome, preco, categoria, posicao = 0, descricao }) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new TypeError('O identificador deve ser um inteiro positivo.');
        }
        if (typeof nome !== 'string' || nome.trim() === '') {
            throw new TypeError('Informe o nome do ativo.');
        }
        if (!Number.isFinite(preco) || preco < 0) {
            throw new TypeError('O preço deve ser um número igual ou maior que zero.');
        }
        if (!Number.isInteger(posicao) || posicao < 0) {
            throw new TypeError('A posição deve ser um inteiro igual ou maior que zero.');
        }
        if (typeof categoria !== 'string' || !categorias.includes(categoria)) {
            throw new TypeError('Selecione uma classe de ativo válida.');
        }
        if (typeof descricao !== 'string') {
            throw new TypeError('A descrição deve ser informada.');
        }

        Object.assign(this, {
            id,
            nome: nome.trim(),
            preco,
            posicao,
            categoria,
            descricao: descricao.trim(),
        });
    }

    calcularValorEmPosicao() {
        return this.preco * this.posicao;
    }
}