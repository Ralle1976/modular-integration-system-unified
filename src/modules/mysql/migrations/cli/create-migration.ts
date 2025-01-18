import fs from 'fs/promises';
import path from 'path';

async function createMigration(name: string): Promise<void> {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${name}.ts`;
  const migrationsDir = path.join(__dirname, '../migrations');

  // Ensure migrations directory exists
  await fs.mkdir(migrationsDir, { recursive: true });

  // Read template
  const templatePath = path.join(__dirname, '../templates/MigrationTemplate.ts');
  const template = await fs.readFile(templatePath, 'utf8');

  // Replace placeholder with migration name
  const content = template.replace('{{name}}', `${timestamp}_${name}`);

  // Write new migration file
  const filePath = path.join(migrationsDir, fileName);
  await fs.writeFile(filePath, content);

  console.log(`Created migration: ${fileName}`);
}

// Handle CLI arguments
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: create-migration <name>');
  process.exit(1);
}

createMigration(args[0]).catch(error => {
  console.error('Failed to create migration:', error);
  process.exit(1);
});