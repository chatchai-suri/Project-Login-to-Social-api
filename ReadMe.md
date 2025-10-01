# Server

## Step 1 create package
```bash
npm init -y
```
### Step 2 install package (dependencies)
```bash
npm install express cors helmet cookie-parser dotenv argon2 jsonwebtoken node-cron passport passport-facebook passport-github2 passport-google-oauth20 zod uuid
```
### Step 3 install package (devDependencies)
```bash
npm install -D prisma nodemon
```
### Step 4 npx prisma init to obtain file .gitignore, .env and folder prisma 
```bash
npx prisma init
```
### Step 5 push to github
create repo at github.com
```bash
git init
git add README.md
git commit -m "Project set up"
git branch -M main
git remote add origin https://github.com/chatchai-suri/Project-Login-to-Social-api.git
git push -u origin main
```
### Step 6 set up database
#### step 6.1 customize schema.prisma to provider = "mysql"
``` schema
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```
#### step 6.2 create schema.prisma model
``` schema
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id       String  @id @default(cuid())
  email    String  @unique
  name     String?
  password String?
  coverImg String? @map("cover_img")

  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp(0)
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamp(0)

  refreshTokens RefreshToken[]
  accounts      Account[]
}

model RefreshToken {
  id        String   @id @default(cuid())
  hashToken String   @unique @map("hash_token")
  revoked   Boolean  @default(false)
  expiresAt DateTime @map("expires_at")

  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp(0)
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamp(0)
  // relations
  user      User?    @relation(fields: [userId], references: [id])
  userId    String?  @map("user_id")
}

model Account {
  id                String @id @default(cuid())
  type              String // 'oauth'
  // 'github', 'google', etc.
  provider          String // 'github', 'google', etc.
  // the id of the account on the provider's side
  providerAccountId String @map("provider_account_id")

  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp(0)
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamp(0)
  // relations
  user      User?    @relation(fields: [userId], references: [id])
  userId    String?  @map("user_id")

  @@unique([provider, providerAccountId])
}
```
#### step 6.3 customize .env to use mysql local
```env
DATABASE_URL="mysql://root:pooSQL123@localhost:3306/db_login_with_social"
```
#### step 6.4 immigate to database
```bash
npx db push
```
schema model DB and folder src/generated was created
#### step 6.5 customize file src/config/prisma.config.js
to export prisma instance with looging enable
```js
// src/config/prisma.config.js
import { PrismaClient } from "..generated/prisma/client.js";

// Create a new instance of the Prisma Client with logging enabled
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Ensure that the Prisma Client instance is properly disconnected when the Node.js process ends
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
```