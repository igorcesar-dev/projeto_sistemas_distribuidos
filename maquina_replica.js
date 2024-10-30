const net = require('net');
const fs = require('fs');
const path = require('path');

const PORT = 8081;  // Porta para a máquina réplica
const replicaDir = path.join(__dirname, 'replica');
const replicaFiles = fs.readdirSync(replicaDir);
console.log('Arquivos disponíveis na réplica:', replicaFiles);

// Configuração do servidor da máquina réplica
const replicaServer = net.createServer((socket) => {
    console.log('Cliente conectado à réplica');

    socket.on('data', (data) => {
        const requestedVersion = data.toString().trim();
        const filePath = path.join(replicaDir, `temperatures_v${requestedVersion}.txt`);
        
        // Verifica se a versão solicitada existe na réplica
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            socket.write(`Versão ${requestedVersion}\n${fileContent}`);
            console.log(`Enviado conteúdo da réplica: temperatures_v${requestedVersion}.txt para o cliente`);
        } else {
            socket.write(`Erro: versão ${requestedVersion} não encontrada na réplica.`);
            console.log(`Erro: versão ${requestedVersion} não encontrada na réplica.`);
        }
    });

    socket.on('end', () => {
        console.log('Cliente desconectado da réplica');
    });
});

// Inicia o servidor da réplica
replicaServer.listen(PORT, () => {
    console.log(`Máquina réplica escutando na porta ${PORT}`);
});
