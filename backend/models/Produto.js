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
        if(typeof categoria !== 'string' || !['precursores químicos controlados','solventes controlados','ácidos controlados','bases controladas','reagentes químicos controlados','fármacos e substâncias farmacêuticas controladas','adulterantes e diluentes controlados','oxidantes controlados','substâncias químicas tóxicas de uso restrito','produtos químicos para uso militar','explosivos e seus precursores controlados','substâncias radioativas controladas','agrotóxicos sujeitos a controle especial','produtos químicos sujeitos a autorização de importação ou exportação','substâncias sujeitas a controle sanitário especial','produtos de limpeza','detergentes','sabões','desinfetantes','alvejantes','removedores','desengordurantes','neutralizadores de odores','aromatizantes de ambientes','cosméticos','produtos de higiene pessoal','perfumes','solventes','tintas','vernizes','esmaltes','adesivos','colas','lubrificantes','óleos industriais','combustíveis','gases industriais','fertilizantes','corretivos de solo','produtos para tratamento de água','reagentes laboratoriais','produtos químicos inorgânicos','produtos químicos orgânicos','sais minerais','ácidos de uso comum','bases de uso comum','produtos para piscinas','produtos automotivos','ceras e polidores','resinas','plásticos','borrachas sintéticas','pigmentos','corantes','produtos fotográficos','produtos para tratamento de madeira','produtos para manutenção doméstica']){
            throw new TypeError('A resposta deve corresponder com as categorias existentes')
        }
        Object.assign(this,{
            id,nome: nome.trim(), preco:preco,estoque:estoque,categoria:categoria.trim()
        });
    }
        calcularValorEmEstoque(){
            return this.preco * this.estoque;
        }
        calcularPrecoComDesconto(percentual){
            if (!Number.isFinite(percentual)|| percentual < 0 || percentual > 100)
            {
                throw new RangeError('Desconto deve estar entre 0 e 100');
            }
            return this.preco * (1 - percentual / 100)
        }
}