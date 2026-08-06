# EasyPanel: Dockerfile path = backend/Dockerfile
# Build context = backend/api
FROM node:22-alpine AS build

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
# Evita el preinstall que instala nodemon global; bcrypt sí necesita rebuild nativo
RUN npm pkg delete scripts.preinstall \
  && npm ci \
  && npm cache clean --force

COPY . .
RUN npm run build

# --- runtime ---
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm pkg delete scripts.preinstall \
  && npm ci --omit=dev \
  && npm cache clean --force \
  && apk del python3 make g++

COPY --from=build /app/dist ./dist

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
