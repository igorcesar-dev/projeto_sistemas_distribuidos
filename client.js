const net = require('net');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SERVER_PORT = 8080; // Porta do servidor principal
const REPLICA_PORT = 8081; // Porta da máquina réplica
const HOST = '192.168.1.230'; // Endereço do servidor principal
const REPLICA_HOST = '192.168.1.230'; // Endereço da máquina réplica (pode ser o mesmo para fins de teste)
const downloadDir = path.join(__dirname, 'downloads');

// Cria a pasta 'downloads' caso não exista
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
}

const client = new net.Socket();

// Função para tentar se conectar ao servidor
function connectToServer(port, host) {
    client.connect(port, host, () => {
        console.log(`Conectado ao servidor na porta ${port}`);
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Digite o número da versão que deseja baixar: ', (version) => {
            client.write(version.trim());  // Envia a versão desejada ao servidor
            rl.close();
        });
    });

    client.on('data', (data) => {
        const response = data.toString();

        if (response.startsWith('Versão')) {
            const [versionLine, ...contentLines] = response.split('\n');
            const versionNumber = versionLine.match(/\d+/)[0];  
            const content = contentLines.join('\n');  

            const filePath = path.join(downloadDir, `temperatures_v${versionNumber}.txt`);
            fs.writeFileSync(filePath, content);

            console.log(`Arquivo temperatures_v${versionNumber}.txt baixado com sucesso e salvo em ${filePath}`);
        } else {
            console.log(response);  // Mensagem de erro
        }

        client.destroy();  // Fecha a conexão
    });

    client.on('close', () => {
        console.log('Conexão com o servidor encerrada');
    });

    client.on('error', (err) => {
        console.error(`Erro ao conectar ao servidor: ${err.message}`);
        client.destroy(); // Fecha a conexão em caso de erro
    });
}

// Tenta se conectar ao servidor principal
connectToServer(SERVER_PORT, HOST);

// Se a conexão falhar, tenta se conectar à réplica
client.on('error', () => {
    console.log('Tentando conectar à máquina réplica...');
    client.removeAllListeners(); // Remove os listeners do servidor principal
    connectToServer(REPLICA_PORT, REPLICA_HOST); // Conecta à réplica
});
