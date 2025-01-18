import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { FileMetadata, UploadOptions } from './types';
import { ErrorHandler } from '../../core/error-handler';

export class GoogleDriveFileService {
  private drive: any;
  private errorHandler: ErrorHandler;

  constructor(authClient: OAuth2Client) {
    this.drive = google.drive({ version: 'v3', auth: authClient });
    this.errorHandler = new ErrorHandler('GoogleDriveFileService');
  }

  /**
   * Datei zu Google Drive hochladen
   */
  async uploadFile(filePath: string, options: UploadOptions): Promise<FileMetadata> {
    try {
      // Prüfen ob die Datei existiert
      if (!fs.existsSync(filePath)) {
        throw new Error(`Datei nicht gefunden: ${filePath}`);
      }

      const fileSize = fs.statSync(filePath).size;
      const fileName = path.basename(filePath);

      // Medien-Metadaten vorbereiten
      const requestMetadata = {
        name: fileName,
        mimeType: options.mimeType || 'application/octet-stream',
        description: options.description,
        parents: options.parentFolderId ? [options.parentFolderId] : undefined
      };

      // Upload für kleine Dateien (< 5MB)
      if (fileSize < 5 * 1024 * 1024) {
        return await this.simpleUpload(filePath, requestMetadata);
      }

      // Resumable Upload für größere Dateien
      return await this.resumableUpload(filePath, requestMetadata, fileSize);
    } catch (error) {
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  /**
   * Einfacher Upload für kleine Dateien
   */
  private async simpleUpload(filePath: string, requestMetadata: any): Promise<FileMetadata> {
    const media = {
      mimeType: requestMetadata.mimeType,
      body: fs.createReadStream(filePath)
    };

    const response = await this.drive.files.create({
      requestBody: requestMetadata,
      media: media,
      fields: 'id, name, mimeType, size, createdTime, modifiedTime, parents'
    });

    return this.mapResponseToFileMetadata(response.data);
  }

  /**
   * Fortsetzbarer Upload für große Dateien
   */
  private async resumableUpload(
    filePath: string,
    requestMetadata: any,
    fileSize: number
  ): Promise<FileMetadata> {
    const chunkSize = 256 * 1024; // 256KB Chunks
    let uploaded = 0;

    const response = await this.drive.files.create({
      requestBody: requestMetadata,
      media: {
        mimeType: requestMetadata.mimeType,
        body: fs.createReadStream(filePath)
      },
      fields: 'id, name, mimeType, size, createdTime, modifiedTime, parents'
    }, {
      onUploadProgress: (evt: any) => {
        uploaded = evt.bytesRead;
        const progress = (uploaded / fileSize) * 100;
        this.emit('uploadProgress', { 
          progress: Math.round(progress), 
          uploaded, 
          total: fileSize 
        });
      }
    });

    return this.mapResponseToFileMetadata(response.data);
  }

  /**
   * Mappt die API-Antwort auf unser FileMetadata Interface
   */
  private mapResponseToFileMetadata(data: any): FileMetadata {
    return {
      id: data.id,
      name: data.name,
      mimeType: data.mimeType,
      size: parseInt(data.size),
      createdTime: data.createdTime,
      modifiedTime: data.modifiedTime,
      parents: data.parents
    };
  }
}