require('dotenv/config');
const { drizzle } = require('drizzle-orm/node-postgres');

async function testConnection() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not found');
    }
    
    console.log('Attempting to connect to:', process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@'));
    
    const db = drizzle(process.env.DATABASE_URL);
    // Test query
    await db.execute('SELECT 1');
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();