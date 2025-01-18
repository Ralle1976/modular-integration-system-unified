module.exports = {
  // MySQL Konfiguration
  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'user',
    password: 'password',
    database: 'db_name',
    connectionLimit: 10,
    maxRetries: 3,
    retryDelay: 5000
  },
  
  // GitHub Konfiguration
  github: {
    token: 'your-github-token',
    owner: 'your-github-username',
    repo: 'your-repo-name',
    apiVersion: '2022-11-28'
  },
  
  // OpenAI Konfiguration
  openai: {
    apiKey: 'your-openai-api-key',
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7
  },
  
  // Google Drive Konfiguration
  googleDrive: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    redirectUri: 'your-redirect-uri',
    scope: ['https://www.googleapis.com/auth/drive']
  },
  
  // Logging Konfiguration
  logging: {
    level: 'INFO',
    file: './logs/app.log',
    maxSize: '10m',
    maxFiles: 5
  },
  
  // Error Handling Konfiguration
  errorHandling: {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 5000
  }
};