import { MySQLConnection } from '../MySQLConnection';

export abstract class Migration {
  protected connection: MySQLConnection;
  public readonly name: string;
  public readonly timestamp: number;

  constructor(name: string) {
    this.connection = MySQLConnection.getInstance();
    this.name = name;
    this.timestamp = Date.now();
  }

  abstract up(): Promise<void>;
  abstract down(): Promise<void>;

  public async execute(): Promise<void> {
    const conn = await this.connection.getConnection();
    await conn.beginTransaction();

    try {
      await this.up();
      await conn.query(
        'INSERT INTO migrations (name, timestamp) VALUES (?, ?)',
        [this.name, this.timestamp]
      );
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  public async rollback(): Promise<void> {
    const conn = await this.connection.getConnection();
    await conn.beginTransaction();

    try {
      await this.down();
      await conn.query('DELETE FROM migrations WHERE name = ?', [this.name]);
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}