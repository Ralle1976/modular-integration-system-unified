import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GoogleDriveConfig } from './types';
import { ErrorHandler } from '../../core/error-handler';

export class GoogleDriveAuthService {
  private oauth2Client: OAuth2Client;
  private errorHandler: ErrorHandler;
  private config: GoogleDriveConfig;
  private tokens: any = null;

  constructor(config: GoogleDriveConfig) {
    this.config = config;
    this.errorHandler = new ErrorHandler('GoogleDriveAuthService');
    
    this.oauth2Client = new google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      this.config.redirectUri
    );
  }

  /**
   * Generiert die Authorization URL für den OAuth2-Flow
   */
  getAuthUrl(): string {
    try {
      return this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: this.config.scopes,
        prompt: 'consent'
      });
    } catch (error) {
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  /**
   * Verarbeitet den Auth-Code und erhält Access- und Refresh-Tokens
   */
  async handleAuthCode(code: string): Promise<void> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.tokens = tokens;
      this.oauth2Client.setCredentials(tokens);
    } catch (error) {
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  /**
   * Aktualisiert den Access Token wenn nötig
   */
  async refreshAccessToken(): Promise<void> {
    try {
      if (!this.tokens?.refresh_token) {
        throw new Error('Kein Refresh Token verfügbar');
      }

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.tokens = credentials;
      this.oauth2Client.setCredentials(credentials);
    } catch (error) {
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  /**
   * Prüft ob die aktuelle Session authentifiziert ist
   */
  isAuthenticated(): boolean {
    return !!this.tokens && !!this.tokens.access_token;
  }

  /**
   * Gibt den authentifizierten OAuth2-Client zurück
   */
  getAuthClient(): OAuth2Client {
    if (!this.isAuthenticated()) {
      throw new Error('Nicht authentifiziert');
    }
    return this.oauth2Client;
  }

  /**
   * Setzt gespeicherte Token für eine bestehende Session
   */
  setStoredTokens(tokens: any): void {
    this.tokens = tokens;
    this.oauth2Client.setCredentials(tokens);
  }
}