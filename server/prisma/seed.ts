import { PrismaClient, Role, RequestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', name: 'Ada Admin', passwordHash: password, role: Role.ADMIN },
  });

  const approver = await prisma.user.upsert({
    where: { email: 'approver@example.com' },
    update: {},
    create: {
      email: 'approver@example.com',
      name: 'Alan Approver',
      passwordHash: password,
      role: Role.APPROVER,
    },
  });

  const requester = await prisma.user.upsert({
    where: { email: 'requester@example.com' },
    update: {},
    create: {
      email: 'requester@example.com',
      name: 'Rita Requester',
      passwordHash: password,
      role: Role.REQUESTER,
    },
  });

  const existing = await prisma.request.count();
  if (existing === 0) {
    await prisma.request.createMany({
      data: [
        {
          title: 'New laptop',
          description: 'Replacement for a broken development machine.',
          amount: '1800.00',
          status: RequestStatus.PENDING,
          requesterId: requester.id,
        },
        {
          title: 'Conference ticket',
          description: 'Annual engineering conference pass.',
          amount: '650.00',
          status: RequestStatus.APPROVED,
          requesterId: requester.id,
          approverId: approver.id,
          decisionNote: 'Budget available.',
          decidedAt: new Date(),
        },
        {
          title: 'Standing desk',
          description: 'Ergonomic desk for the home office.',
          amount: '420.00',
          status: RequestStatus.REJECTED,
          requesterId: requester.id,
          approverId: approver.id,
          decisionNote: 'Deferred to next quarter.',
          decidedAt: new Date(),
        },
      ],
    });
  }

  console.log('Seeded users:', [admin.email, approver.email, requester.email].join(', '));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
