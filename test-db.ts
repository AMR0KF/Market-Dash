import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.category.count();
  console.log('Category count:', count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
