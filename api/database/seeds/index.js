const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create demo company
  const demoCompany = await prisma.company.upsert({
    where: { slug: 'continuo-demo-company' },
    update: {},
    create: {
      name: 'Continuo Demo Company',
      slug: 'continuo-demo-company',
      email: 'admin@continuo-demo.com',
      phone: '+1-555-0123',
      website: 'https://continuo-demo.com',
      description: 'A demo company for testing Continuo features',
      address: '123 Demo Street',
      city: 'Demo City',
      state: 'DC',
      zipCode: '12345',
      country: 'USA',
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
      }
    }
  });

  console.log('✅ Demo company created:', demoCompany.name);

  // Create admin user
  const adminPassword = await bcrypt.hash('TestPassword123!', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@continuo-demo.com' },
    update: {},
    create: {
      email: 'admin@continuo-demo.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      companyId: demoCompany.id
    }
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create employee user
  const employeePassword = await bcrypt.hash('Employee123!', 12);
  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@continuo-demo.com' },
    update: {},
    create: {
      email: 'employee@continuo-demo.com',
      password: employeePassword,
      firstName: 'Demo',
      lastName: 'Employee',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      companyId: demoCompany.id
    }
  });

  console.log('✅ Employee user created:', employeeUser.email);

  // Create demo customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        companyId: demoCompany.id,
        name: 'Acme Corporation',
        type: 'COMPANY',
        status: 'ACTIVE',
        email: 'contact@acme.com',
        phone: '+1-555-0101',
        website: 'https://acme.com',
        address: {
          street: '456 Business Ave',
          city: 'Business City',
          state: 'BC',
          zipCode: '54321',
          country: 'USA'
        },
        industry: 'Technology',
        size: '51-200',
        notes: 'High-value customer, interested in enterprise features',
        tags: ['enterprise', 'technology']
      }
    }),
    prisma.customer.create({
      data: {
        companyId: demoCompany.id,
        name: 'TechStart Inc',
        type: 'COMPANY',
        status: 'ACTIVE',
        email: 'hello@techstart.com',
        phone: '+1-555-0202',
        website: 'https://techstart.com',
        address: {
          street: '789 Innovation Blvd',
          city: 'Tech City',
          state: 'TC',
          zipCode: '67890',
          country: 'USA'
        },
        industry: 'Software',
        size: '11-50',
        notes: 'Startup company, needs scalable solutions',
        tags: ['startup', 'software']
      }
    })
  ]);

  console.log('✅ Demo customers created:', customers.length);

  // Create demo leads
  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        companyId: demoCompany.id,
        name: 'Mike Johnson',
        email: 'prospect@newcompany.com',
        phone: '+1-555-0303',
        website: 'https://newcompany.com',
        company: 'New Company LLC',
        source: 'COLD_OUTREACH',
        status: 'NEW',
        score: 75,
        industry: 'Manufacturing',
        size: '11-50',
        notes: 'Interested in CRM features, follow up next week',
        tags: ['prospect', 'manufacturing']
      }
    }),
    prisma.lead.create({
      data: {
        companyId: demoCompany.id,
        name: 'Sarah Wilson',
        email: 'sarah@growthcorp.com',
        phone: '+1-555-0404',
        website: 'https://growthcorp.com',
        company: 'Growth Corporation',
        source: 'WEBSITE',
        status: 'CONTACTED',
        score: 90,
        industry: 'Finance',
        size: '51-200',
        notes: 'High priority lead, ready for demo',
        tags: ['hot-lead', 'finance']
      }
    })
  ]);

  console.log('✅ Demo leads created:', leads.length);

  // Create demo chart of accounts
  const chartOfAccounts = await Promise.all([
    // Assets
    prisma.account.upsert({
      where: { 
        companyId_code: { 
          companyId: demoCompany.id, 
          code: '1000' 
        } 
      },
      update: {},
      create: {
        companyId: demoCompany.id,
        code: '1000',
        name: 'Cash',
        type: 'ASSET',
        category: 'CURRENT_ASSETS',
        description: 'Cash and cash equivalents'
      }
    }),
    prisma.account.upsert({
      where: { 
        companyId_code: { 
          companyId: demoCompany.id, 
          code: '1100' 
        } 
      },
      update: {},
      create: {
        companyId: demoCompany.id,
        code: '1100',
        name: 'Accounts Receivable',
        type: 'ASSET',
        category: 'CURRENT_ASSETS',
        description: 'Amounts owed by customers'
      }
    }),
    // Liabilities
    prisma.account.upsert({
      where: { 
        companyId_code: { 
          companyId: demoCompany.id, 
          code: '2000' 
        } 
      },
      update: {},
      create: {
        companyId: demoCompany.id,
        code: '2000',
        name: 'Accounts Payable',
        type: 'LIABILITY',
        category: 'CURRENT_LIABILITIES',
        description: 'Amounts owed to suppliers'
      }
    }),
    // Equity
    prisma.account.upsert({
      where: { 
        companyId_code: { 
          companyId: demoCompany.id, 
          code: '3000' 
        } 
      },
      update: {},
      create: {
        companyId: demoCompany.id,
        code: '3000',
        name: 'Owner\'s Equity',
        type: 'EQUITY',
        category: 'OWNERS_EQUITY',
        description: 'Owner\'s investment in the business'
      }
    }),
    // Revenue
    prisma.account.upsert({
      where: { 
        companyId_code: { 
          companyId: demoCompany.id, 
          code: '4000' 
        } 
      },
      update: {},
      create: {
        companyId: demoCompany.id,
        code: '4000',
        name: 'Sales Revenue',
        type: 'REVENUE',
        category: 'OPERATING_REVENUE',
        description: 'Revenue from sales of goods and services'
      }
    }),
    // Expenses
    prisma.account.upsert({
      where: { 
        companyId_code: { 
          companyId: demoCompany.id, 
          code: '5000' 
        } 
      },
      update: {},
      create: {
        companyId: demoCompany.id,
        code: '5000',
        name: 'Cost of Goods Sold',
        type: 'EXPENSE',
        category: 'COST_OF_GOODS_SOLD',
        description: 'Direct costs of producing goods sold'
      }
    }),
    prisma.account.upsert({
      where: { 
        companyId_code: { 
          companyId: demoCompany.id, 
          code: '6000' 
        } 
      },
      update: {},
      create: {
        companyId: demoCompany.id,
        code: '6000',
        name: 'Operating Expenses',
        type: 'EXPENSE',
        category: 'OPERATING_EXPENSES',
        description: 'General operating expenses'
      }
    })
  ]);

  console.log('✅ Chart of accounts created:', chartOfAccounts.length);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Demo Account Information:');
  console.log('   Company: Continuo Demo Company');
  console.log('   Email: admin@continuo-demo.com');
  console.log('   Password: TestPassword123!');
  console.log('\n   Employee Email: employee@continuo-demo.com');
  console.log('   Employee Password: Employee123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 