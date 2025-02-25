import { PrismaClient } from "@prisma/client";

// Rozwiązanie problemu z Hot Reloadingiem w Next.js + Serverless Functions
// Zapobiega tworzeniu wielu instancji Prisma Client

// Deklarujemy globalny obiekt z typem, który może zawierać naszą instancję Prisma
declare global {
  var prisma: PrismaClient | undefined;
}

// Tworzymy klienta z uwzględnieniem środowiska
export const prisma = global.prisma || 
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// W trybie development przypisujemy instancję do globalnego obiektu
// W środowisku produkcyjnym (Netlify) każda funkcja serverless będzie tworzyć własną instancję
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
} 