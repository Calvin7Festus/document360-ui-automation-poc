import { Page } from '@playwright/test';
import { ApiActions } from '../commons/api-actions';
import { loggers } from '../utils/logging/logger-factory';

/**
 * Authentication API Class
 * Handles all authentication related operations (login, token validation, user profile, etc.)
 * Extends the common ApiActions base class
 */
export class AuthApi extends ApiActions {
  
  constructor(page: Page) {
    super(page);
  }

  /**
   * Validate authentication token by making a test API call
   */
  async validateToken(token?: string): Promise<boolean> {
    const authToken = token || this.getAuthToken();
    
    if (!authToken) {
      loggers.api.debug('🔍 No auth token available for validation');
      return false;
    }

    // Temporarily set token for validation
    const originalToken = this.authToken;
    this.setAuthToken(authToken);

    try {
      const response = await this.get('/api/v2/user/profile');
      
      if (response.ok()) {
        loggers.api.debug('✅ Token validation successful');
        return true;
      } else {
        loggers.api.debug(`❌ Token validation failed - Status: ${response.status()}`);
        return false;
      }
    } catch (error) {
      loggers.api.debug('❌ Token validation error:', error);
      return false;
    } finally {
      // Restore original token
      this.authToken = originalToken;
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(): Promise<any> {
    try {
      loggers.api.debug('👤 Getting user profile');
      
      const response = await this.get('/api/v2/user/profile');
      const profileData = await this.handleResponse(response, 'Get user profile');
      
      loggers.api.info(`✅ User profile retrieved successfully`);
      return profileData;

    } catch (error) {
      loggers.api.error('❌ Failed to get user profile:', error);
      throw error;
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(): Promise<any> {
    try {
      loggers.api.debug('🔐 Getting user permissions');
      
      const response = await this.get('/api/v2/user/permissions');
      const permissionsData = await this.handleResponse(response, 'Get user permissions');
      
      loggers.api.info(`✅ User permissions retrieved successfully`);
      return permissionsData;

    } catch (error) {
      loggers.api.error('❌ Failed to get user permissions:', error);
      throw error;
    }
  }

  /**
   * Refresh authentication token (if supported by the API)
   */
  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      loggers.api.debug('🔄 Refreshing authentication token');
      
      const response = await this.post('/connect/token', {
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      });

      const tokenData = await this.handleResponse<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
        token_type: string;
      }>(response, 'Token refresh');

      const result = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in
      };

      // Update the current token
      this.setAuthToken(result.accessToken);
      
      loggers.api.info(`✅ Token refreshed successfully, expires in ${result.expiresIn} seconds`);
      return result;

    } catch (error) {
      loggers.api.error('❌ Failed to refresh token:', error);
      throw error;
    }
  }

  /**
   * Logout user (if supported by the API)
   */
  async logout(): Promise<void> {
    try {
      loggers.api.debug('👋 Logging out user');
      
      const response = await this.post('/api/v2/auth/logout', {});
      await this.handleResponse(response, 'User logout');
      
      // Clear the auth token
      this.setAuthToken('');
      
      loggers.api.info('✅ User logged out successfully');

    } catch (error) {
      loggers.api.error('❌ Failed to logout user:', error);
      throw error;
    }
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(permission: string): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions();
      
      // Check if the permission exists in the user's permissions
      // This will depend on the actual structure of the permissions response
      const hasPermission = permissions.result?.permissions?.includes(permission) ||
                           permissions.permissions?.includes(permission) ||
                           false;

      loggers.api.debug(`🔍 User has permission '${permission}': ${hasPermission}`);
      return hasPermission;

    } catch (error) {
      loggers.api.debug(`❌ Failed to check permission '${permission}':`, error);
      return false;
    }
  }

  /**
   * Get authentication status and user info
   */
  async getAuthStatus(): Promise<{
    isAuthenticated: boolean;
    user?: any;
    permissions?: any;
    tokenValid: boolean;
  }> {
    try {
      const tokenValid = await this.validateToken();
      
      if (!tokenValid) {
        return {
          isAuthenticated: false,
          tokenValid: false
        };
      }

      const [user, permissions] = await Promise.allSettled([
        this.getUserProfile(),
        this.getUserPermissions()
      ]);

      return {
        isAuthenticated: true,
        tokenValid: true,
        user: user.status === 'fulfilled' ? user.value : null,
        permissions: permissions.status === 'fulfilled' ? permissions.value : null
      };

    } catch (error) {
      loggers.api.error('❌ Failed to get auth status:', error);
      return {
        isAuthenticated: false,
        tokenValid: false
      };
    }
  }

  /**
   * Wait for authentication to be available
   */
  async waitForAuthentication(timeoutMs: number = 30000): Promise<{
    token: string;
    isValid: boolean;
  }> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const token = this.getAuthToken();
      
      if (token && token.length > 10) {
        const isValid = await this.validateToken(token);
        
        if (isValid) {
          loggers.api.info('✅ Authentication is available and valid');
          return { token, isValid: true };
        }
      }
      
      await this.page.waitForTimeout(1000);
    }
    
    throw new Error(`Authentication not available within ${timeoutMs}ms`);
  }

  /**
   * Ensure authentication is valid, throw error if not
   */
  async ensureAuthenticated(): Promise<void> {
    const authStatus = await this.getAuthStatus();
    
    if (!authStatus.isAuthenticated || !authStatus.tokenValid) {
      throw new Error('User is not authenticated or token is invalid');
    }
    
    loggers.api.debug('✅ Authentication verified');
  }
}
