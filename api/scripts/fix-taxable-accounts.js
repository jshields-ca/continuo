const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updatedRevenue = await prisma.account.updateMany({
    where: { type: 'REVENUE' },
    data: { isTaxable: true },
  });
  const updatedExpense = await prisma.account.updateMany({
    where: { type: 'EXPENSE' },
    data: { isTaxable: true },
  });
  const updatedOther = await prisma.account.updateMany({
    where: { NOT: [{ type: 'REVENUE' }, { type: 'EXPENSE' }] },
    data: { isTaxable: false },
  });
  console.log('Updated revenue accounts:', updatedRevenue.count);
  console.log('Updated expense accounts:', updatedExpense.count);
  console.log('Updated other accounts:', updatedOther.count);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect()); 