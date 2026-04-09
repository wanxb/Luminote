FROM node:20-alpine

WORKDIR /app

COPY apps/api-node ./apps/api-node
WORKDIR /app/apps/api-node

RUN npm ci

ENV HOST=0.0.0.0
ENV PORT=8788
ENV CONTENT_SOURCE=file
ENV PERSISTENCE_DRIVER=sqlite
ENV STORAGE_MODE=local

EXPOSE 8788

CMD ["npm", "run", "start"]
