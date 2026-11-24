FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma7.config.ts ./
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
