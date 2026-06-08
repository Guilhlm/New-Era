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

  await prisma.workoutDayPlan.upsert({
    where: {
      userId_weekday: { userId: user.id, weekday: 1 },
    },
    update: {},
    create: {
      userId: user.id,
      weekday: 1,
      title: 'Chest | Triceps',
      notes: null,
      groups: {
        create: [
          {
            name: 'Chest Exercicies',
            timeMinutes: 40,
            sortOrder: 0,
            exercises: {
              create: [
                {
                  name: 'Bench Press',
                  equipment: 'Bar',
                  weightKg: 100,
                  series: 4,
                  repsMin: 5,
                  repsMax: 6,
                  sortOrder: 0,
                },
                {
                  name: 'Incline Dumbbell Press',
                  equipment: 'Dumbbell',
                  weightKg: 32,
                  series: 3,
                  repsMin: 8,
                  repsMax: 10,
                  sortOrder: 1,
                },
              ],
            },
          },
          {
            name: 'Triceps Exercicies',
            timeMinutes: 40,
            sortOrder: 1,
            exercises: {
              create: [
                {
                  name: 'Triceps Pushdown',
                  equipment: 'Cable',
                  weightKg: 40,
                  series: 4,
                  repsMin: 10,
                  repsMax: 12,
                  sortOrder: 0,
                },
                {
                  name: 'Skull Crusher',
                  equipment: 'Bar',
                  weightKg: 30,
                  series: 3,
                  repsMin: 8,
                  repsMax: 10,
                  sortOrder: 1,
                },
              ],
            },
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
