import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { Logger } from './logger';
import { ConfigManager } from './config-manager';

interface UserCredentials {
  username: string;
  password: string;
}

interface UserData {
  id: string;
  username: string;
  roles: string[];
}

export class AuthService {
  private static instance: AuthService;
  private logger: Logger;
  private config: ConfigManager;
  private users: Map<string, UserData & { passwordHash: string }> = new Map();

  private constructor() {
    this.logger = Logger.getInstance();
    this.config = ConfigManager.getInstance();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async registerUser(credentials: UserCredentials, roles: string[] = ['user']): Promise<UserData> {
    const { username, password } = credentials;

    if (this.users.has(username)) {
      throw new Error('Username already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userData: UserData & { passwordHash: string } = {
      id: this.generateUniqueId(),
      username,
      roles,
      passwordHash
    };

    this.users.set(username, userData);
    this.logger.info(`User ${username} registered successfully`);

    // Remove sensitive data before returning
    const { passwordHash: _, ...safeUserData } = userData;
    return safeUserData;
  }

  public async authenticateUser(credentials: UserCredentials): Promise<string | null> {
    const { username, password } = credentials;
    const user = this.users.get(username);

    if (!user) {
      this.logger.warn(`Login attempt for non-existent user: ${username}`);
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      this.logger.warn(`Invalid password attempt for user: ${username}`);
      return null;
    }

    return this.generateJWTToken(user);
  }

  private generateJWTToken(user: UserData): string {
    const secretKey = this.config.get('JWT_SECRET') as string || 'default-secret-key';
    
    return jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        roles: user.roles 
      },
      secretKey,
      { 
        expiresIn: '24h',
        algorithm: 'HS256' 
      }
    );
  }

  public verifyJWTToken(token: string): UserData | null {
    const secretKey = this.config.get('JWT_SECRET') as string || 'default-secret-key';

    try {
      const decoded = jwt.verify(token, secretKey) as UserData;
      return decoded;
    } catch (error) {
      this.logger.error(`JWT Verification failed: ${error}`);
      return null;
    }
  }

  public hasRole(user: UserData, requiredRoles: string[]): boolean {
    return requiredRoles.some(role => user.roles.includes(role));
  }

  private generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  public listUsers(): UserData[] {
    return Array.from(this.users.values()).map(({ passwordHash, ...userData }) => userData);
  }
}