# Spyfall

Este repositório contém o código base do jogo multiplayer de tabuleiro [spyfall](https://www.spyfall.app/).

As principais tecnologias usadas no projeto foram: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Socket.io](https://socket.io/), [Bootstrap](https://getbootstrap.com/) e [Express](https://expressjs.com/pt-br/).

## Sobre o jogo

### Tutorial em vídeo

Caso prefira, existe [um tutorial em vídeo muito bom no YouTube, feito pelo canal Covil dos Jogos](https://youtu.be/OdbCMcpCR4c?si=jx8pOGtwF-S0b2Zg)

### Contexto

Você é um detetive e está em uma festa com outras pessoas. Porém, um dos presentes é um espião que não sabe onde está.

### Recomendações para jogatina

- 3 a 8 pessoas

- Todos podendo se comunicar um com os outros, sendo presencialmente ou não

- Um dispositivo para cada jogador

### Como jogar

Será sorteado uma pessoa para ser o **espião** e todos outros serão os **detetives (não espiões)**. Também será sorteado um **lugar** para onde todos estão indo. O espião não sabe onde está, mas os detetives sim. Os objetivos de cada um são:

- **Espião**: descobrir onde está, acabar com o tempo e não ser descoberto ou fazer com que outro detetive seja acusado como espião

- **Detetives**: descobrir quem é o espião

### Rodadas

No início de cada rodada, todos os jogadores, exceto o espião, recebem uma **profissão** e um **lugar**. A profissão é o que o jogador faz no lugar sorteado, podendo ser usada para fazer "atuações" daquela profissão. A atuação pela profissão é opcional, mas sempre serão sorteadas. No começo da rodada, um jogador será escolhido como questionador, tendo que escolher um dos outros jogadores para fazer **uma pergunta** a respeito do lugar. O perguntado deve responder a pergunta, buscando não dar muitos detalhes (para não dar muita informação para o espião), mas o suficiente para remover suspeitas dos outros detetives. O espião, quando perguntando ou perguntar, deve blefar, podendo soar suspeito. Existem três formas de acabar a rodada:

**Votação unanime**: a qualquer momento na partida, um jogador pode acusar outro jogador, abrindo uma votação. Para a votação ser aprovada, todos os jogadores devem concordar com ela. Caso pelo menos um dos jogadores recuse a votação, ela será encerrada e a rodada continuará normalmente. O acusado não tem poder de voto em sua acusação. Caso a votação seja aceita e o espião tenha sido o acusado, todos os detetives ganham pontos, sendo que o acusador ganha pontos extras. Caso o acusado seja um detetive, o espião ganha.
  
**Adivinhação do local**: a qualquer momento da partida o espião pode tentar adivinhar o local. Se o espião adivinhar o local corretamente, ele ganha, caso contrário, todos os detetives ganham.

**Tempo acabou**: no começo da rodada, um cronômetro será iniciado. Caso o tempo acabe, o espião ganha

## Prints do jogo

! COMPLETAR AQUI !

## Instalação e execução

! COMPLETAR SOBRE !

### Como executar - Modo desenvolvimento

1 - Ir na pasta `backend`

2 - `docker-compose up`

3 - Novamente na mesma pasta, em outro terminal, executar `npm run server`

4 - Escolher o frontend "spyfall-br-adm" ou "spyfall-br-game" e rodar `npm run start`

### Como executar - prod

1 - Configurar `.env`

2 - `docker-compose up`

## Backup

! COMPLETAR SOBRE !

### Criando arquivo de backup

### Aplicando backup ao banco de dados

docker ps

docker exec -i <container-id> pg_dump -U postgres -d spyfall -F c --clean --create -f dumpfile

docker cp <container-id>:dumpfile ./dumpfile

RODAR DUAS VEZES (NÃO SEI AO CERTO O MOTIVO, MAS RODAR APENAS UMA VEZ NÃO RESTAURA TUDO...):
docker exec -i <container-id> pg_restore -U postgres -d spyfall --clean --create < dumpfile

OBS: é preciso reiniciar o docker-compose após usar o comando `pg_restore`. Isso, pois os dados ficam em memória no backend...