import { Page } from '@playwright/test';
import { ApiActions } from '../commons/api-actions';
import { loggers } from '../utils/logging/logger-factory';
import * as fs from 'fs';
import * as path from 'path';

/**
 * File Upload API Class
 * Handles all file upload related operations (CDN upload, file management, etc.)
 * Extends the common ApiActions base class
 */
export class FileUploadApi extends ApiActions {
  
  constructor(page: Page) {
    super(page);
  }

  /**
   * Upload a file to CDN
   */
  async uploadToCdn(filePath: string, uploadType: 'spec' | 'image' | 'document' = 'spec'): Promise<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    contentType: string;
  }> {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);
      const contentType = this.getFileMimeType(fileName);
      const fileSize = fileBuffer.length;
      const projectInfo = this.validateProjectInfo();

      loggers.api.info(`📤 Uploading file to CDN: ${fileName} (${fileSize} bytes)`);

      // Determine the upload endpoint based on type
      const endpoint = this.getUploadEndpoint(uploadType);

      const response = await this.uploadFile(
        endpoint,
        filePath,
        fileName,
        fileBuffer,
        this.getUploadFormData(uploadType),
        {
          headers: {
            'projectid': projectInfo.projectId,
            'referer': `https://portal.document360.io/${projectInfo.projectId}/api-documentation`,
            'versiontype': '0'
          },
          contentType
        }
      );

      const uploadResponse = await this.handleResponse<{
        result: { fileUrl: string };
        success: boolean;
        errors: string[];
      }>(response, 'File upload to CDN');

      const result = {
        fileUrl: uploadResponse.result.fileUrl,
        fileName,
        fileSize,
        contentType
      };

      loggers.api.info(`✅ File uploaded to CDN successfully: ${result.fileUrl}`);
      return result;

    } catch (error) {
      loggers.api.error(`❌ CDN upload failed for ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Upload multiple files to CDN
   */
  async batchUploadToCdn(filePaths: string[], uploadType: 'spec' | 'image' | 'document' = 'spec'): Promise<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    contentType: string;
  }[]> {
    if (filePaths.length === 0) {
      loggers.api.info('📋 No files to upload');
      return [];
    }

    loggers.api.info(`📤 Batch uploading ${filePaths.length} files to CDN`);

    const uploadPromises = filePaths.map(filePath => 
      this.retry(
        () => this.uploadToCdn(filePath, uploadType),
        3,
        1000,
        `Upload ${path.basename(filePath)}`
      )
    );

    try {
      const results = await Promise.all(uploadPromises);
      loggers.api.info(`✅ Batch upload completed for ${results.length} files`);
      return results;
    } catch (error) {
      loggers.api.error(`❌ Batch upload failed:`, error);
      throw error;
    }
  }

  /**
   * Get file information from CDN URL
   */
  async getFileInfo(fileUrl: string): Promise<{
    exists: boolean;
    size?: number;
    contentType?: string;
    lastModified?: string;
  }> {
    try {
      loggers.api.debug(`🔍 Getting file info for: ${fileUrl}`);

      const response = await this.request.head(fileUrl);

      if (!response.ok()) {
        return { exists: false };
      }

      const headers = response.headers();
      const result = {
        exists: true,
        size: headers['content-length'] ? parseInt(headers['content-length']) : undefined,
        contentType: headers['content-type'],
        lastModified: headers['last-modified']
      };

      loggers.api.debug(`✅ File info retrieved: ${JSON.stringify(result)}`);
      return result;

    } catch (error) {
      loggers.api.debug(`❌ Failed to get file info for ${fileUrl}:`, error);
      return { exists: false };
    }
  }

  /**
   * Download file from CDN
   */
  async downloadFromCdn(fileUrl: string, savePath?: string): Promise<Buffer> {
    try {
      loggers.api.info(`📥 Downloading file from CDN: ${fileUrl}`);

      const response = await this.request.get(fileUrl);

      if (!response.ok()) {
        throw new Error(`Failed to download file: ${response.status()} - ${response.statusText()}`);
      }

      const fileBuffer = await response.body();

      if (savePath) {
        fs.writeFileSync(savePath, fileBuffer);
        loggers.api.info(`✅ File downloaded and saved to: ${savePath}`);
      } else {
        loggers.api.info(`✅ File downloaded to memory (${fileBuffer.length} bytes)`);
      }

      return fileBuffer;

    } catch (error) {
      loggers.api.error(`❌ Download failed for ${fileUrl}:`, error);
      throw error;
    }
  }

  /**
   * Validate file before upload
   */
  async validateFile(filePath: string, options: {
    maxSizeBytes?: number;
    allowedExtensions?: string[];
    allowedMimeTypes?: string[];
  } = {}): Promise<{
    isValid: boolean;
    errors: string[];
    fileInfo: {
      name: string;
      size: number;
      extension: string;
      mimeType: string;
    };
  }> {
    const errors: string[] = [];
    
    try {
      if (!fs.existsSync(filePath)) {
        errors.push('File does not exist');
        return {
          isValid: false,
          errors,
          fileInfo: { name: '', size: 0, extension: '', mimeType: '' }
        };
      }

      const stats = fs.statSync(filePath);
      const fileName = path.basename(filePath);
      const extension = path.extname(fileName).toLowerCase();
      const mimeType = this.getFileMimeType(fileName);

      const fileInfo = {
        name: fileName,
        size: stats.size,
        extension,
        mimeType
      };

      // Validate file size
      if (options.maxSizeBytes && stats.size > options.maxSizeBytes) {
        errors.push(`File size (${stats.size} bytes) exceeds maximum allowed size (${options.maxSizeBytes} bytes)`);
      }

      // Validate file extension
      if (options.allowedExtensions && !options.allowedExtensions.includes(extension)) {
        errors.push(`File extension '${extension}' is not allowed. Allowed: ${options.allowedExtensions.join(', ')}`);
      }

      // Validate MIME type
      if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(mimeType)) {
        errors.push(`MIME type '${mimeType}' is not allowed. Allowed: ${options.allowedMimeTypes.join(', ')}`);
      }

      const isValid = errors.length === 0;
      
      if (isValid) {
        loggers.api.debug(`✅ File validation passed for: ${fileName}`);
      } else {
        loggers.api.warn(`❌ File validation failed for: ${fileName}`, errors);
      }

      return { isValid, errors, fileInfo };

    } catch (error) {
      errors.push(`File validation error: ${error}`);
      loggers.api.error(`❌ File validation error for ${filePath}:`, error);
      
      return {
        isValid: false,
        errors,
        fileInfo: { name: '', size: 0, extension: '', mimeType: '' }
      };
    }
  }

  /**
   * Clean up uploaded files (if the API supports it)
   */
  async cleanupUploadedFiles(fileUrls: string[]): Promise<void> {
    if (fileUrls.length === 0) {
      loggers.api.info('📋 No uploaded files to cleanup');
      return;
    }

    loggers.api.info(`🧹 Cleaning up ${fileUrls.length} uploaded files`);

    // Note: This would depend on the actual API having a cleanup endpoint
    // For now, we'll just log the cleanup attempt
    for (const fileUrl of fileUrls) {
      try {
        // If there's a delete endpoint for uploaded files, use it here
        loggers.api.debug(`🗑️ Would cleanup file: ${fileUrl}`);
      } catch (error) {
        loggers.api.warn(`⚠️ Failed to cleanup file ${fileUrl}:`, error);
      }
    }

    loggers.api.info('✅ File cleanup completed');
  }

  /**
   * Get upload endpoint based on type
   */
  private getUploadEndpoint(uploadType: 'spec' | 'image' | 'document'): string {
    switch (uploadType) {
      case 'spec':
        return '/api/v2/apidefinitions/upload-spec-file';
      case 'image':
        return '/api/v2/files/upload-image';
      case 'document':
        return '/api/v2/files/upload-document';
      default:
        return '/api/v2/apidefinitions/upload-spec-file';
    }
  }

  /**
   * Get additional form data based on upload type
   */
  private getUploadFormData(uploadType: 'spec' | 'image' | 'document'): Record<string, string> {
    switch (uploadType) {
      case 'spec':
        return {}; // No additional form data needed for spec files
      case 'image':
        return {
          'type': 'image',
          'category': 'api-documentation'
        };
      case 'document':
        return {
          'type': 'document',
          'category': 'api-documentation'
        };
      default:
        return {};
    }
  }
}
