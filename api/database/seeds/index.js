const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create a test company
    console.log('📊 Creating test company...');
    let testCompany = await prisma.company.findFirst({
      where: { name: 'BizFlow Demo Company' }
    });

    if (!testCompany) {
      testCompany = await prisma.company.create({
        data: {
          name: 'BizFlow Demo Company',
          slug: 'bizflow-demo-company',
          email: 'admin@bizflow-demo.com',
          phone: '+1 (555) 123-4567',
          website: 'https://bizflow-demo.com',
          description: 'A demo company for testing BizFlow features',
          industry: 'Technology',
          size: '11-50',
          country: 'United States',
          state: 'California',
          city: 'San Francisco',
          address: '123 Demo Street',
          zipCode: '94105',
          currency: 'USD',
          timezone: 'America/Los_Angeles',
          status: 'ACTIVE',
          plan: 'PROFESSIONAL',
          maxUsers: 10,
          settings: {
            theme: 'light',
            notifications: {
              email: true,
              push: true
            }
          }
        }
      });
    }

    console.log('✅ Test company created:', testCompany.name);

    // Create a test admin user
    console.log('👤 Creating test admin user...');
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
    
    let testUser = await prisma.user.findUnique({
      where: { email: 'admin@bizflow-demo.com' }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'admin@bizflow-demo.com',
          firstName: 'Demo',
          lastName: 'Administrator',
          password: hashedPassword,
          role: 'OWNER',
          status: 'ACTIVE',
          avatar: null,
          phone: '+1 (555) 123-4567',
          timezone: 'America/Los_Angeles',
          emailVerified: true,
          companyId: testCompany.id
        }
      });
    }

    console.log('✅ Test admin user created:', testUser.email);

    // Create a test employee user
    console.log('👤 Creating test employee user...');
    const employeePassword = await bcrypt.hash('Employee123!', 12);
    
    let testEmployee = await prisma.user.findUnique({
      where: { email: 'employee@bizflow-demo.com' }
    });

    if (!testEmployee) {
      testEmployee = await prisma.user.create({
        data: {
          email: 'employee@bizflow-demo.com',
          firstName: 'Demo',
          lastName: 'Employee',
          password: employeePassword,
          role: 'EMPLOYEE',
          status: 'ACTIVE',
          avatar: null,
          phone: '+1 (555) 987-6543',
          timezone: 'America/Los_Angeles',
          emailVerified: true,
          companyId: testCompany.id
        }
      });
    }

    console.log('✅ Test employee user created:', testEmployee.email);

    // Create some audit log entries
    console.log('📝 Creating sample audit logs...');
    await prisma.auditLog.createMany({
      data: [
        {
          userId: testUser.id,
          companyId: testCompany.id,
          action: 'CREATE',
          entity: 'Company',
          entityId: testCompany.id,
          newValues: { name: testCompany.name },
          ipAddress: '127.0.0.1',
          userAgent: 'Seed Script'
        },
        {
          userId: testUser.id,
          companyId: testCompany.id,
          action: 'CREATE',
          entity: 'User',
          entityId: testUser.id,
          newValues: { email: testUser.email, role: testUser.role },
          ipAddress: '127.0.0.1',
          userAgent: 'Seed Script'
        }
      ]
    });

    console.log('✅ Sample audit logs created');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Test Account Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Admin Account:');
    console.log('   Email: admin@bizflow-demo.com');
    console.log('   Password: TestPassword123!');
    console.log('   Role: Owner');
    console.log('');
    console.log('👤 Employee Account:');
    console.log('   Email: employee@bizflow-demo.com');
    console.log('   Password: Employee123!');
    console.log('   Role: Employee');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌐 You can now login at: http://localhost:3000/auth/login');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 