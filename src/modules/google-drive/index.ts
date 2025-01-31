import { EventEmitter } from 'events';
import { google } from 'googleapis';
import { GoogleDriveConfig, FileMetadata, UploadOptions, ListOptions } from './types';
import { ErrorHandler } from '../../core/error-handler';
import { GoogleDriveAuthService } from './auth-service';
import { GoogleDriveFileService } from './file-service';

export class GoogleDriveModule extends EventEmitter {
  private config: GoogleDriveConfig;
  private errorHandler: ErrorHandler;
  private authService: GoogleDriveAuthService;
  private fileService: GoogleDriveFileService | null = null;

  constructor(config: GoogleDriveConfig) {
    super();
    this.config = config;
    this.errorHandler = new ErrorHandler('GoogleDriveModule');
    this.authService = new GoogleDriveAuthService(config);

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      if (this.authService.isAuthenticated()) {
        this.fileService = new GoogleDriveFileService(this.authService.getAuthClient());
      }
      this.emit('ready');
    } catch (error) {
      this.errorHandler.handleError(error);
      this.emit('error', error);
    }
  }

  /**
   * Gibt die Auth-URL für den OAuth2-Flow zurück
   */
  getAuthUrl(): string {
    return this.authService.getAuthUrl();
  }

  /**
   * Verarbeitet den Auth-Code aus dem OAuth2-Flow
   */
  async handleAuthCode(code: string): Promise<void> {
    try {
      await this.authService.handleAuthCode(code);
      this.fileService = new GoogleDriveFileService(this.authService.getAuthClient());
      this.emit('authenticated');
    } catch (error) {
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  /**
   * Prüft den Authentifizierungsstatus
   */
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  /**
   * Lädt eine Datei zu Google Drive hoch
   */
  async uploadFile(filePath: string, options: UploadOptions): Promise<FileMetadata> {
    try {
      if (!this.fileService) {
        throw new Error('Modul nicht initialisiert oder nicht authentifiziert');
      }
      return await this.fileService.uploadFile(filePath, options);
    } catch (error) {
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  /**
   * Lädt eine Datei von Google Drive herunter
   */
  async downloadFile(fileId: string, destinationPath: string): Promise<void> {
    try {
      if (!this.fileService) {
        throw new Error('Modul nicht initialisiert oder nicht authentifiziert');
      }
      // Implementation folgt
      throw new Error('Noch nicht implementiert');
    } catch (error) {
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  /**
   * Listet Dateien in Google Drive auf
   */
  async listFiles(options?: ListOptions): Promise<FileMetadata[]> {
    try {
      if (!this.fileService) {
        throw new Error('Modul nicht initialisiert oder nicht authentifiziert');
      }
      // Implementation folgt
      throw new Error('Noch nicht implementiert');
    } catch (error) {
      this.errorHandler.handleError(error);
      throw error;
    }
  }
}