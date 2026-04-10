import { PrismaClient, TransactionType, WalletType, InvestmentType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@new-era.local';
  const passwordHash = await bcrypt.hash('123456', 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: 'Usuário Demo',
      email,
      passwordHash,
      monthlyIncome: 4500,
    },
  });

  const wallet = await prisma.wallet.create({
    data: {
      userId: user.id,
      name: 'Carteira Principal',
      type: WalletType.BANK,
      balance: 2000,
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: TransactionType.INCOME,
      amount: 2000,
      description: 'Saldo inicial',
      category: 'Inicial',
      toWalletId: wallet.id,
      date: new Date(),
    },
  });

  await prisma.investment.create({
    data: {
      userId: user.id,
      name: 'Reserva CDI',
      type: InvestmentType.FIXED_INCOME,
      currentValue: 500,
      costValue: 500,
      notes: 'Investimento inicial de exemplo',
    },
  });

  await prisma.dietMeal.create({
    data: {
      userId: user.id,
      name: 'Café da manhã',
      weekday: 1,
      mealTime: '08:00',
      items: {
        create: [
          {
            name: 'Ovos',
            totalGrams: 100,
            protein: 13,
            fats: 10,
            carbodrate: 1,
            calories: 155,
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
