FROM node:18-alpine
ARG game_path=/spyfall
ARG db_path=/spyfall/db
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY . .
WORKDIR /home/node/app/backend
RUN npm install
WORKDIR /home/node/app/frontend/spyfall-br-game
RUN npm install
ENV PUBLIC_URL $game_path
ENV REACT_APP_DB_PATH $db_path
RUN npm run build
COPY --chown=node:node . .
WORKDIR /home/node/app/backend
EXPOSE 3000
CMD [ "node", "src/index.js" ]
