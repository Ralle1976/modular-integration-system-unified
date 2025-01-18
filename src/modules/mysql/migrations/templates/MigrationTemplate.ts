import { Migration } from '../Migration';

export default class implements Migration {
  constructor() {
    super('{{name}}');
  }

  public async up(): Promise<void> {
    // Implement your migration logic here
    await this.connection.query(`
      -- Your SQL statements here
    `);
  }

  public async down(): Promise<void> {
    // Implement your rollback logic here
    await this.connection.query(`
      -- Your rollback SQL statements here
    `);
  }
}