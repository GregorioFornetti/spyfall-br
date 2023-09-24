
## Como fazer backup

docker ps

docker exec -i <container-id> pg_dump -U postgres -d spyfall -F c > dumpfile

docker exec -i <container-id> pg_restore -U postgres -d spyfall < dumpfile

OBS: é preciso reiniciar o docker-compose após usar o comando `pg_restore`. Isso, pois os dados ficam em memória no backend...

## Como executar - dev

1 - Ir na pasta `backend`
2 - `docker-compose up`
3 - Novamente na mesma pasta, em outro terminal, executar `npm run server`
4 - Escolher o frontend "spyfall-br-adm" ou "spyfall-br-game" e rodar `npm run start`

## Como executar - prod

1 - Configurar `.env`
2 - `docker-compose up`