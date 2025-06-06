const { execSync } = require('child_process');

// Database configuration
const config = {
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'chronocore_dev',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  nodeEnv: process.env.NODE_ENV || 'development',
};

// Log the configuration
console.log('Database configuration:');
console.log('- Host:', config.host);
console.log('- Port:', config.port);
console.log('- Database:', config.database);
console.log('- User:', config.user);
console.log('- NODE_ENV:', config.nodeEnv);

function createDatabase() {
  console.log('\n=== Creating database if it does not exist ===');
  try {
    const cmd = `PGPASSWORD="${config.password}" psql -h ${config.host} -p ${config.port} -U ${config.user} -tc "SELECT 1 FROM pg_database WHERE datname = '${config.database}'" | grep -q 1 || PGPASSWORD="${config.password}" createdb -h ${config.host} -p ${config.port} -U ${config.user} ${config.database}`;
    console.log('Executing command:', cmd.replace(new RegExp(config.password, 'g'), '****'));
    execSync(cmd, { stdio: 'inherit' });
    console.log('✅ Database created or already exists');
    return true;
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    return false;
  }
}

function runMigrations() {
  console.log('\n=== Running database migrations ===');
  try {
    // Set up environment variables for Sequelize CLI
    process.env.SEQUELIZE_ENV = config.nodeEnv;
    process.env.DATABASE_URL = `postgres://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
    
    console.log('Using database URL:', `postgres://${config.user}:****@${config.host}:${config.port}/${config.database}`);
    
    // Run migrations
    console.log('Executing migrations...');
    execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
    console.log('✅ Migrations completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error running migrations:', error.message);
    return false;
  }
}

function main() {
  console.log('\n=== Starting database setup ===');
  
  // Create database if it doesn't exist
  const dbCreated = createDatabase();
  if (!dbCreated) {
    console.error('❌ Failed to create database');
    process.exit(1);
  }
  
  // Run migrations
  const migrationsRun = runMigrations();
  if (!migrationsRun) {
    console.error('❌ Failed to run migrations');
    process.exit(1);
  }
  
  console.log('\n✅ Database setup completed successfully!');
  process.exit(0);
}

// Run the main function
main();
