FROM node:20-alpine

WORKDIR /app

COPY apps/api-node ./apps/api-node

ENV HOST=0.0.0.0
ENV PORT=8788
ENV CONTENT_SOURCE=file
ENV STORAGE_MODE=local

EXPOSE 8788

CMD ["node", "apps/api-node/src/server.mjs"]
