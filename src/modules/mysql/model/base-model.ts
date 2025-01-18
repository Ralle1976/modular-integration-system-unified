export interface ModelDefinition {
  table: string;
  primaryKey: string;
  fields: Record<string, string>;
}

export abstract class BaseModel {
  protected static tableName: string;
  protected static primaryKey: string = 'id';
  protected fields: Record<string, any> = {};

  public static getDefinition(): ModelDefinition {
    return {
      table: this.tableName,
      primaryKey: this.primaryKey,
      fields: {}
    };
  }

  public getAttribute(key: string): any {
    return this.fields[key];
  }

  public setAttribute(key: string, value: any): void {
    this.fields[key] = value;
  }

  public getPrimaryKey(): any {
    return this.getAttribute(BaseModel.primaryKey);
  }
}