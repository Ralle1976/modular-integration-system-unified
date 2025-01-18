export interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface FileMetadata {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  createdTime: string;
  modifiedTime: string;
  parents?: string[];
}

export interface UploadOptions {
  parentFolderId?: string;
  description?: string;
  mimeType: string;
}

export interface ListOptions {
  pageSize?: number;
  pageToken?: string;
  fields?: string[];
  orderBy?: string[];
  query?: string;
}

export interface BatchOperationResult {
  success: boolean;
  fileId?: string;
  error?: Error;
}

export type BatchOperation = {
  operation: 'upload' | 'download' | 'delete';
  params: any;
};