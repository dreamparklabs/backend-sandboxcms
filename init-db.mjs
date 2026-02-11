// Initialize Payload with production database to create schema
import { getPayload } from 'payload';
import { fileURLToPath } from 'url';
import path from 'path';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Set production database URL
process.env.DATABASE_URL = 'postgresql://postgres:pzyURrVHOXvQhNEStULlaQTwXgTJHEpO@shinkansen.proxy.rlwy.net:34337/railway';
process.env.PAYLOAD_SECRET = 'dev-secret-for-schema-push';

async function initDatabase() {
  try {
    console.log('Initializing Payload with production database...');
    
    // Dynamic import of the config
    const configModule = await import('./src/payload.config.ts');
    const config = configModule.default;
    
    const payload = await getPayload({ config });
    
    console.log('Payload initialized! Schema should be created.');
    console.log('Checking tables...');
    
    // Try to count users to verify
    const users = await payload.find({ collection: 'users', limit: 1 });
    console.log('Users table exists, count:', users.totalDocs);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

initDatabase();
