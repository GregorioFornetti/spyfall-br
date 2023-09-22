FROM node:18-alpine
ARG adm_path
ARG game_path
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY . .
WORKDIR /home/node/app/backend
RUN npm install
WORKDIR /home/node/app/frontend/spyfall-br-adm
RUN npm install
ENV PUBLIC_URL $adm_path
RUN npm run build
WORKDIR /home/node/app/frontend/spyfall-br-game
RUN npm install
ENV PUBLIC_URL $game_path
RUN npm run build
COPY --chown=node:node . .
EXPOSE 3000
CMD [ "node", "app.js" ]