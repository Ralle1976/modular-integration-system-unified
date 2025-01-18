import { MySQLModule } from '../mysql-module';

export abstract class Migration {
  protected mysql: MySQLModule;
  public name: string;
  public timestamp: number;

  constructor() {
    this.mysql = MySQLModule.getInstance();
    this.timestamp = Date.now();
    this.name = this.constructor.name;
  }

  abstract execute(): Promise<void>;
  abstract rollback(): Promise<void>;
}