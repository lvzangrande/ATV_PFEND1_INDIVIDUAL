export default class Produto{
    constructor({id,nome,preco,categoria,estoque=0}){
        if(!Number.isInteger(id) || id <=0){
            throw new TypeError('Id deve ser inteiro ou maior que 0');
        }
        if(typeof nome !== 'string' || nome.trim()===''){
            throw new TypeError('Nome é obrigatorio');
        }
        if(!Number.isFinite(preco) || preco > 0){
            throw new TypeError('Preço deve ser válido');
        }
        if(!Number.isInteger(estoque)|| estoque < 0){
            throw new TypeError('Estoque deve ser inteiro, maior ou igual a 0');
        }
        if(typeof categoria !== 'string' || ![''])
    }
}