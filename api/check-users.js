const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users found:', users.length);
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.id})`);
    });
    
    const leads = await prisma.lead.findMany({
      include: {
        assignedUser: true
      }
    });
    console.log('\nLeads found:', leads.length);
    leads.forEach(lead => {
      console.log(`- ${lead.name}: assignedTo=${lead.assignedTo}, assignedUser=${lead.assignedUser ? `${lead.assignedUser.firstName} ${lead.assignedUser.lastName}` : 'null'}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 