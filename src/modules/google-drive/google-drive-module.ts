import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Logger } from '../../core/logger';
import { ErrorHandler } from '../../core/error-handler';

export class GoogleDriveModule {
  private static instance: GoogleDriveModule;
  private drive;
  private auth: OAuth2Client;
  private logger: Logger;
  private errorHandler: ErrorHandler;

  protected constructor() {
    this.logger = Logger.getInstance();
    this.errorHandler = ErrorHandler.getInstance();
    
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  public static getInstance(): GoogleDriveModule {
    if (!GoogleDriveModule.instance) {
      GoogleDriveModule.instance = new GoogleDriveModule();
    }
    return GoogleDriveModule.instance;
  }

  public async uploadFile(filePath: string, name: string): Promise<string> {
    try {
      const response = await this.drive.files.create({
        requestBody: {
          name: name,
        },
        media: {
          body: filePath
        }
      });

      return response.data.id || '';
    } catch (error) {
      this.logger.error('Failed to upload file', { error });
      throw error;
    }
  }

  public async downloadFile(fileId: string): Promise<Buffer> {
    try {
      const response = await this.drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );
      
      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error('Failed to download file', { error });
      throw error;
    }
  }
}