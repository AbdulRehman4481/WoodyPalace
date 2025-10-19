import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@example.com' },
    update: {
      passwordHash,
      isActive: true,
    },
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Created admin user:', {
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  console.log('\n📝 Login credentials:');
  console.log('   Email: admin@example.com');
  console.log('   Password: admin123');
  console.log('\n✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

