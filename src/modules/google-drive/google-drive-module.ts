import { google } from 'googleapis';
import { ModuleInterface } from '../../core/module-manager';
import { ConfigManager } from '../../core/config-manager';
import { Logger } from '../../core/logger';
import * as fs from 'fs';
import * as path from 'path';

export class GoogleDriveModule implements ModuleInterface {
  public name: string = 'google-drive';
  private config: ConfigManager;
  private logger: Logger;
  private drive: any = null;

  constructor() {
    this.config = ConfigManager.getInstance();
    this.logger = Logger.getInstance();
  }

  public isEnabled(): boolean {
    return this.config.get('modules.googleDrive.enabled', false) as boolean;
  }

  public async initialize(): Promise<boolean> {
    if (!this.isEnabled()) {
      this.logger.info('Google Drive module is disabled');
      return false;
    }

    const credentialsPath = this.config.get('GOOGLE_DRIVE_CREDENTIALS') as string;
    
    if (!credentialsPath) {
      this.logger.error('No Google Drive credentials provided');
      return false;
    }

    try {
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive']
      });

      this.drive = google.drive({ version: 'v3', auth });
      
      // Test connection
      await this.listFiles();
      
      this.logger.info('Google Drive module initialized successfully');
      return true;
    } catch (error) {
      this.logger.error(`Google Drive initialization failed: ${error}`);
      return false;
    }
  }

  public async shutdown(): Promise<void> {
    if (this.drive) {
      this.logger.info('Google Drive module shutting down');
      this.drive = null;
    }
  }

  public async listFiles(query?: string): Promise<any[]> {
    if (!this.drive) {
      throw new Error('Google Drive client not initialized');
    }

    try {
      const response = await this.drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name, mimeType)',
        q: query
      });

      return response.data.files;
    } catch (error) {
      this.logger.error(`Error listing Google Drive files: ${error}`);
      throw error;
    }
  }

  public async uploadFile(filePath: string, parentFolderId?: string): Promise<any> {
    if (!this.drive) {
      throw new Error('Google Drive client not initialized');
    }

    try {
      const fileMetadata = {
        name: path.basename(filePath),
        parents: parentFolderId ? [parentFolderId] : []
      };

      const media = {
        mimeType: this.getMimeType(filePath),
        body: fs.createReadStream(filePath)
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
      });

      this.logger.info(`File ${filePath} uploaded successfully`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error uploading file to Google Drive: ${error}`);
      throw error;
    }
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.jpg': 'image/jpeg',
      '.png': 'image/png'
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}