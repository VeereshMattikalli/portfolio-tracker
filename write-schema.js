const fs = require('fs');

const schemaContent = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = "postgresql://postgres:password@localhost:5432/portfolio_tracker?schema=public"
}

model User {
  id            String      @id @default(cuid())
  name          String?
  email         String      @unique
  passwordHash  String
  phoneNumber   String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  portfolios    Portfolio[]
}

model Portfolio {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  assets      Asset[]
}

model Asset {
  id            String   @id @default(cuid())
  name          String
  tickerSymbol  String
  type          String   // "Stock", "Mutual Fund", "ETF", "Commodity", "Crypto"
  quantity      Float
  averagePrice  Float
  latestPrice   Float?   // Optional field for storing cached market data
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  portfolioId   String
  portfolio     Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)

  transactions  Transaction[]
}

model Transaction {
  id               String   @id @default(cuid())
  type             String   // "BUY" or "SELL"
  quantity         Float    // Number of shares/units transacted
  price            Float    // Price per unit
  date             DateTime // Date of the transaction
  broker           String?
  brokerageCharges Float    @default(0)
  createdAt        DateTime @default(now())

  assetId          String
  asset            Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)
}
`;

fs.writeFileSync('./prisma/schema.prisma', schemaContent, { encoding: 'utf8' });
console.log("Schema created.");
