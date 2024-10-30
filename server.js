const net = require('net');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const fileDir = path.join(__dirname, 'data');
const replicaDir = path.join(__dirname, 'replica');
const MAX_VERSIONS = 5;
let version = 1;

// Lista de cidades do sudoeste da Bahia
const cities = ['Vitória da Conquista', 'Itapetinga', 'Jequié', 'Brumado', 'Poções', 'Guanambi', 'Caetité', 'Barra do Choça', 'Igaporã'];

// Função para gerar uma temperatura aleatória entre 18°C e 35°C
function getRandomTemperature() {
    return Math.floor(Math.random() * (35 - 18 + 1)) + 18;
}

// Criação dos diretórios se ainda não existirem
if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir);
if (!fs.existsSync(replicaDir)) fs.mkdirSync(replicaDir);

// Função para criar uma nova versão do arquivo com temperaturas aleatórias
function createNewVersion() {
    const filename = `temperatures_v${version}.txt`;
    const filePath = path.join(fileDir, filename);
    const replicaPath = path.join(replicaDir, filename);

    // Gera dados de temperatura aleatórios para cada cidade
    const temperatureData = cities.map(city => `${city}: ${getRandomTemperature()}°C`).join('\n');
    const content = `Versão ${version} - Relação de Temperaturas do Sudoeste da Bahia:\n${temperatureData}`;
    
    fs.writeFileSync(filePath, content);  // Salva nova versão no servidor
    fs.writeFileSync(replicaPath, content);  // Replica a versão na máquina de réplica

    console.log(`Nova versão criada e replicada: ${filename}`);
    version++;

    // Limita o número de versões na réplica para o número máximo permitido
    const files = fs.readdirSync(replicaDir);
    if (files.length > MAX_VERSIONS) {
        const oldestFile = files.sort()[0];  // Seleciona a versão mais antiga
        fs.unlinkSync(path.join(replicaDir, oldestFile));  // Remove a versão antiga
        console.log(`Versão antiga removida: ${oldestFile}`);
    }
}

// Criação de versões iniciais para simulação
for (let i = 0; i < MAX_VERSIONS; i++) {
    createNewVersion();
}

// Configuração do servidor para lidar com solicitações do cliente
const server = net.createServer((socket) => {
    console.log('Cliente conectado');

    socket.on('data', (data) => {
        const requestedVersion = data.toString().trim();
        const filePath = path.join(fileDir, `temperatures_v${requestedVersion}.txt`);
        
        // Verifica se a versão solicitada existe
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            socket.write(`Versão ${requestedVersion}\n${fileContent}`);
            console.log(`Enviado conteúdo de temperatures_v${requestedVersion}.txt para o cliente`);
        } else {
            socket.write(`Erro: versão ${requestedVersion} não encontrada.`);
            console.log(`Erro: versão ${requestedVersion} não encontrada no servidor.`);
        }
    });

    socket.on('end', () => {
        console.log('Cliente desconectado');
    });
});

server.listen(PORT, () => {
    console.log(`Servidor escutando na porta ${PORT}`);
});
