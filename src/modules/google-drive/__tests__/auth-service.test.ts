import { GoogleDriveAuthService } from '../auth-service';

describe('GoogleDriveAuthService', () => {
  const mockConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/callback',
    scopes: ['https://www.googleapis.com/auth/drive.file']
  };

  let authService: GoogleDriveAuthService;

  beforeEach(() => {
    authService = new GoogleDriveAuthService(mockConfig);
  });

  describe('getAuthUrl', () => {
    it('should generate a valid authorization URL', () => {
      const authUrl = authService.getAuthUrl();
      expect(authUrl).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(authUrl).toContain(mockConfig.clientId);
      expect(authUrl).toContain(mockConfig.redirectUri);
      expect(authUrl).toContain(encodeURIComponent(mockConfig.scopes[0]));
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no tokens are set', () => {
      expect(authService.isAuthenticated()).toBeFalsy();
    });

    it('should return true after setting valid tokens', () => {
      authService.setStoredTokens({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expiry_date: Date.now() + 3600000
      });
      expect(authService.isAuthenticated()).toBeTruthy();
    });
  });

  describe('handleAuthCode', () => {
    it('should throw error for invalid auth code', async () => {
      await expect(authService.handleAuthCode('invalid-code'))
        .rejects
        .toThrow();
    });
  });
});