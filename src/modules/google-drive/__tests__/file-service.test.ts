import fs from 'fs';
import { GoogleDriveFileService } from '../file-service';
import { OAuth2Client } from 'google-auth-library';

jest.mock('fs');
jest.mock('googleapis');

describe('GoogleDriveFileService', () => {
  let fileService: GoogleDriveFileService;
  let mockAuthClient: OAuth2Client;

  beforeEach(() => {
    mockAuthClient = {
      setCredentials: jest.fn(),
      // Weitere OAuth2Client Mock-Methoden...
    } as any;

    fileService = new GoogleDriveFileService(mockAuthClient);
  });

  describe('uploadFile', () => {
    const mockFilePath = '/path/to/test.txt';
    const mockOptions = {
      mimeType: 'text/plain',
      description: 'Test file'
    };

    beforeEach(() => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({ size: 1024 });
    });

    it('should throw error if file does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(fileService.uploadFile(mockFilePath, mockOptions))
        .rejects
        .toThrow('Datei nicht gefunden');
    });

    it('should use simple upload for small files', async () => {
      const mockResponse = {
        data: {
          id: 'test-id',
          name: 'test.txt',
          mimeType: 'text/plain',
          size: '1024',
          createdTime: '2025-01-18T12:00:00.000Z',
          modifiedTime: '2025-01-18T12:00:00.000Z'
        }
      };

      // Mock für drive.files.create
      (fileService as any).drive.files.create = jest.fn().mockResolvedValue(mockResponse);

      const result = await fileService.uploadFile(mockFilePath, mockOptions);

      expect(result).toEqual({
        id: 'test-id',
        name: 'test.txt',
        mimeType: 'text/plain',
        size: 1024,
        createdTime: '2025-01-18T12:00:00.000Z',
        modifiedTime: '2025-01-18T12:00:00.000Z'
      });
    });

    it('should use resumable upload for large files', async () => {
      (fs.statSync as jest.Mock).mockReturnValue({ size: 6 * 1024 * 1024 }); // 6MB

      const mockResponse = {
        data: {
          id: 'test-id',
          name: 'test.txt',
          mimeType: 'text/plain',
          size: '6291456',
          createdTime: '2025-01-18T12:00:00.000Z',
          modifiedTime: '2025-01-18T12:00:00.000Z'
        }
      };

      // Mock für drive.files.create mit Fortschritts-Callback
      (fileService as any).drive.files.create = jest.fn()
        .mockImplementation((params, options) => {
          // Simuliere Fortschritts-Updates
          if (options?.onUploadProgress) {
            options.onUploadProgress({ bytesRead: 3145728 }); // 50% Fortschritt
            options.onUploadProgress({ bytesRead: 6291456 }); // 100% Fortschritt
          }
          return Promise.resolve(mockResponse);
        });

      const result = await fileService.uploadFile(mockFilePath, mockOptions);

      expect(result.size).toBe(6291456);
      // Weitere Assertions für die Upload-Progress-Events könnten hier erfolgen
    });
  });
});