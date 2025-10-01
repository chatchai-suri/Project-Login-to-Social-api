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
### Step 7 Middleware Setup and start server
#### step 7.1 src/app.js import lib or package
```js 
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.middleware.js";
```
#### step 7.2 src/app.js make and use express instance
``` js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(helmet()); // Use Helmet to help secure Express apps with various HTTP headers
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
); // Enable CORS for all routes and allow credentials (cookies, authorization headers, etc.)

app.use(express.json()); // Parse incoming JSON requests and put the parsed data in req.body

app.use(cookieParser()); // Parse Cookie header and populate req.cookies with an object keyed by the cookie names, req.cookies

// API routes
// ... your route handlers here ...
```
#### step 7.3 src/app.js Error handle of path not found
```js
// API routes
// ... your route handlers here ...

app.use((req, res) => {
  res.status(404).json({ message: `path not found ${req.method} ${req.url}` }); // Handle 404 errors for undefined routes
});
```
#### step 7.4 src/middlewares/error.middleware.js prepare file.js for all other error handling
```js
import { ZodError } from "zod";

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  if(error instanceof ZodError) {
    const validateErrors = error.errors.reduce((acc, cur) => (
      {
        ...acc,
        [cur.path[0]]: cur.message
      }
    ), {});

    error.errors = validateErrors;
  }

  res.status(...error, err.statusCode || 500).json({ message: err.message || 'Somthing went wrong' });
}

export default errorMiddleware;
```
#### step 7.5 src/app.js update by call error.middleware.js from app.js
!!! becareful when import src/middlewares/error.middleware.js must confirm ".js" at the enf file name
```js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(helmet()); // Use Helmet to help secure Express apps with various HTTP headers
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
); // Enable CORS for all routes and allow credentials (cookies, authorization headers, etc.)

app.use(express.json()); // Parse incoming JSON requests and put the parsed data in req.body

app.use(cookieParser()); // Parse Cookie header and populate req.cookies with an object keyed by the cookie names, req.cookies

// API routes
// ... your route handlers here ...

app.use((req, res) => {
  res.status(404).json({ message: `path not found ${req.method} ${req.url}` }); // Handle 404 errors for undefined routes
});
app.use(errorMiddleware); // Error handling middleware

export default app;
```
### step 7.6 .env update PORT no. of backend and CLIENT_URL for use.core()
```env
PORT=8887 // backend port

DATABASE_URL="mysql://root:pooSQL123@localhost:3306/db_login_with_social"

CLIENT_URL="http://localhost:5173"
```
#### step 7.7 package.json update id found error(warning) (node:122656) [MODULE_TYPELESS_PACKAGE_JSON] by add "type": "module"
```json
{
  "name": "server",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module", // add this line
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "nodemon src/server.js"
  },
```
#### step 7.8 src/server.js update by call app.js
```js
import app from "./app.js";

const PORT = process.env.PORT || 8887;

app.listen(PORT, console.log(`Server is running on port ${PORT}`));
```
#### step 7.9 start server
```bash
npm run dev
```