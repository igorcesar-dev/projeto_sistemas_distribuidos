const fs = require('fs');
const net = require('net');
const path = require('path');

const SERVER_ADDRESS = 'localhost';
const SERVER_PORT = 4000;
let version = 0; // Contador de versões

// Função para criar um novo arquivo de réplica
function createReplicaFile(data) {
  version++;
  const replicaFilePath = path.join(__dirname, `temperaturas_replica_v${version}.txt`);

  fs.writeFile(replicaFilePath, data, (err) => {
    if (err) {
      console.error('Erro ao criar o arquivo de réplica:', err);
      return;
    }
    console.log(`Réplica atualizada. Nova versão: ${version} - ${replicaFilePath}`);
  });
}

// Conecta ao servidor
const client = net.createConnection(SERVER_PORT, SERVER_ADDRESS, () => {
  console.log('Conectado ao servidor.');
  client.write('GET_TEMPERATURAS'); // Solicita o conteúdo inicial do arquivo
});

// Recebe dados do servidor
client.on('data', (data) => {
  const message = data.toString().trim();

  if (message === 'NOVA_VERSAO') {
    console.log('Nova versão detectada no servidor. Solicitando atualização...');
    
    // Solicita o conteúdo do arquivo atualizado
    fs.readFile('temperaturas.txt', (err, fileData) => {
      if (err) {
        console.error('Erro ao ler o arquivo:', err);
        return;
      }
      createReplicaFile(fileData); // Cria nova versão na réplica com o conteúdo recebido
    });
  }
});

client.on('end', () => {
  console.log('Desconectado do servidor.');
});

client.on('error', (err) => {
  console.error('Erro de conexão:', err);
});
