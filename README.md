
# Projeto da matéria de Sistemas Distribuídos - IFBA

## Tema 14: Consistência contínua em termos dos desvios de ordenação
• O cliente fará uma requisição de download a um arquivo .txt que contém uma
relação de temperaturas de cidades da região do sudoeste da Bahia. Este arquivo
estará armazenado tanto no servidor quando na máquina de réplica, porém, cada
atualização do arquivo no servidor gerará uma nova versão na máquina réplica.
Após um número x de versões, o cliente poderá escolher qual delas será a versão
do arquivo mutuamente consistente.


## Variáveis de Ambiente

Para rodar esse projeto, você vai precisar adicionar as seguintes variáveis de ambiente nos arquivos client.js, server.js e maquina_replica.js

`SERVER_PORT` // Porta do servidor principal

`REPLICA_PORT` // Porta da máquina réplica

`SERVER_HOST` // Endereço do servidor principal

`REPLICA_HOST` / Endereço da máquina réplica (pode ser o mesmo para fins de teste)

## Execução do código
É necessário ter o Node.js atualizado.

* Para rodar o servidor principal do projeto basta digitar o seguinte comando

```bash
  node server.js
```

* Para rodar a máquina réplica do projeto basta digitar o seguinte comando

```bash
  node maquina_replica.js
```  

* Para rodar a máquina cliente do projeto basta digitar o seguinte comando

```bash
  node client.js
```  