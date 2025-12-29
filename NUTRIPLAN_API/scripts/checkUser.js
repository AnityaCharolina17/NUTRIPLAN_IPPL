const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const email = process.argv[2] || 'admin@nutriplan.com';
const password = process.argv[3] || 'password123';

async function main() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    console.log('User:', user);
    if (!user) return;
    const match = await bcrypt.compare(password, user.password);
    console.log(`Password match for '${password}':`, match);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
