import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Logger } from '../../core/logger';

export class GoogleDriveModule {
  private static instance: GoogleDriveModule;
  private drive;
  private logger: Logger;

  private constructor() {
    this.logger = Logger.getInstance();
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    this.drive = google.drive({ version: 'v3', auth });
  }

  public static getInstance(): GoogleDriveModule {
    if (!GoogleDriveModule.instance) {
      GoogleDriveModule.instance = new GoogleDriveModule();
    }
    return GoogleDriveModule.instance;
  }

  public async uploadFile(filePath: string): Promise<string> {
    try {
      const response = await this.drive.files.create({
        requestBody: {
          name: 'file.txt',
        },
        media: {
          body: filePath
        }
      });

      return response.data.id;
    } catch (error) {
      this.logger.error('Failed to upload file', { error });
      throw error;
    }
  }
}