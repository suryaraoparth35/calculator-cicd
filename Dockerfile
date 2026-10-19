FROM node:22-alpine
ENV NODE_ENV=production PORT=8080
WORKDIR /app
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node server.js ./
COPY --chown=node:node public/ ./public/
USER node
EXPOSE 8080
CMD ["node", "server.js"]
