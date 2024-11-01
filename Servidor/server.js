const fs = require('fs');
const net = require('net');

const PORT = 4000;
let replicaSockets = [];
let isDebouncing = false;
const debounceDelay = 1000;
let previousFileContent = '';

// Cria o servidor
const server = net.createServer((socket) => {
  console.log('Cliente conectado.');
  
  // Adiciona o socket de réplica
  replicaSockets.push(socket);

  socket.on('end', () => {
    console.log('Cliente desconectado.');
    replicaSockets = replicaSockets.filter(s => s !== socket);
  });
});

// Função para enviar notificação de nova versão para réplicas conectadas
function notifyReplicas() {
  replicaSockets.forEach(socket => {
    socket.write('NOVA_VERSAO\n');
  });
}

// Monitoramento de alterações em temperaturas.txt
fs.watch('temperaturas.txt', (eventType) => {
  if (eventType === 'change') {
    fs.readFile('temperaturas.txt', (err, newFileContent) => {
      if (err) {
        console.error('Erro ao ler o arquivo:', err);
        return;
      }

      // Verifica se o conteúdo do arquivo mudou
      if (newFileContent.toString() !== previousFileContent) {
        console.log('Arquivo temperaturas.txt foi modificado.');
        previousFileContent = newFileContent.toString();

        if (!isDebouncing) {
          isDebouncing = true;
          setTimeout(() => {
            notifyReplicas(); // Notifica a réplica
            isDebouncing = false;
          }, debounceDelay);
        }
      }
    });
  }
});

// Inicia o servidor
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
