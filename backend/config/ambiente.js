const nomesObrigatorios = ['PORT', 'DB_HOST', 'DB_USER', 'DB_PORT', 'DB_NAME'];

export function carregarAmbiente(arquivoDeConfiguracao){
    if(arquivoDeConfiguracao){
        try{
            process.loadEnvFile(arquivoDeConfiguracao);
        } catch {
            throw new Error(`Arqivo de config não encontrado: ${arquivoDeConfiguracao}`);
        }
    }
    const ausentes = nomesObrigatorios.filter((nome) =>{
        const valor = process.env[nome];
        return typeof valor !== 'string' || valor.trim()==='';
    });
    if (ausentes.length > 0){
        throw new Error (`Configure no .env ${ausentes.join(',')}`)
    }
    return{
        nomeAluno: process.env.NOME_ALUNO,
        turma: process.env.TURMA,
        porta: process.env.PORT,
        ambiente: process.env.NODE_ENV || 'development'
    }
}
    export function exibirDiagnostico(config){
        console.table({
            estudante: config.nomeAluno,
            turma: config.turma,
            projeto: 'api-produtos',
            node: process.version,
            sistema: `${process.platform} ${process.arch}`,
            diretorio: process.cwd(),
            portaConfigurada: configuracao.porta
        })
    }