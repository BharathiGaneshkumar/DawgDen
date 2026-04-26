import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Missing DATABASE_URL");
  
  const adapter = new PrismaPg(connectionString);
  const prisma = new PrismaClient({ adapter });

  console.log("Checking types in database...");
  const types: any = await prisma.$queryRaw`SELECT n.nspname as schema, t.typname as type 
                                       FROM pg_type t 
                                       LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
                                       WHERE n.nspname = 'public'`;
  console.log("Types:", JSON.stringify(types, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
