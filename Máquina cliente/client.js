const net = require('net');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SERVER_ADDRESS = 'localhost';
const SERVER_PORT = 4000;
const CHECK_INTERVAL = 5000; // Intervalo de verificação em milissegundos (5 segundos)

let availableVersions = [];
let updateCount = 0; // Contador de atualizações recebidas

// Função para exibir as versões disponíveis
function listAvailableVersions() {
  const files = fs.readdirSync(__dirname);
  const versions = files
    .filter(file => file.startsWith('temperaturas_replica_v'))
    .map(file => {
      const versionNumber = file.match(/v(\d+)/)[1];
      return versionNumber;
    });
  return [...new Set(versions)]; // Retorna versões únicas
}

// Função para baixar o arquivo de uma versão específica
function downloadFile(versionToDownload) {
  const replicaFilePath = path.join(__dirname, `temperaturas_replica_v${versionToDownload}.txt`);

  fs.readFile(replicaFilePath, 'utf-8', (err, data) => {
    if (err) {
      console.error(`Erro ao ler a versão ${versionToDownload}:`, err);
      return;
    }
    console.log(`Conteúdo da versão ${versionToDownload}:\n${data}`);
  });
}

// Função para verificar e atualizar versões disponíveis
function checkForNewVersions() {
  const currentVersions = listAvailableVersions();

  // Verifica se há novas versões
  currentVersions.forEach(version => {
    if (!availableVersions.includes(version)) {
      availableVersions.push(version);
      updateCount++; // Incrementa o contador de atualizações
      console.log(`Nova versão detectada: ${version}`);
    }
  });

  // Exibe as versões disponíveis após 3 atualizações
  if (updateCount >= 3) {
    console.log('Versões disponíveis:');
    availableVersions.forEach(version => {
      console.log(`Versão ${version}`);
    });
    promptForVersion(); // Pergunta ao usuário sobre a versão após 3 atualizações
    updateCount = 0; // Reseta o contador de atualizações para próximas notificações
  }
}

// Função para perguntar ao usuário sobre a versão para download
function promptForVersion() {
  rl.question('Escolha uma versão para download (ou pressione Enter para ignorar): ', (answer) => {
    if (answer) {
      const versionToDownload = parseInt(answer);
      if (availableVersions.includes(versionToDownload.toString())) {
        downloadFile(versionToDownload); // Chama a função para baixar a versão escolhida
      } else {
        console.log('Versão inválida.');
      }
    }
    rl.close(); // Fecha a interface de readline após a resposta
  });
}

// Cria interface de readline para captura de entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Conecta ao servidor
const client = net.createConnection(SERVER_PORT, SERVER_ADDRESS, () => {
  console.log('Conectado ao servidor.');

  // Inicializa a lista de versões
  availableVersions = listAvailableVersions();

  // Verifica versões a cada intervalo
  setInterval(checkForNewVersions, CHECK_INTERVAL);
});

client.on('end', () => {
  console.log('Desconectado do servidor.');
});

client.on('error', (err) => {
  console.error('Erro de conexão:', err);
});
