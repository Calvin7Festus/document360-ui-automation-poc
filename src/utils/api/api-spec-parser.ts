import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

export interface ApiSpec {
  info: {
    title: string;
    version: string;
    description?: string;
    termsOfService?: string;
    contact?: {
      name?: string;
      email?: string;
      url?: string;
    };
    license?: {
      name?: string;
      url?: string;
    };
  };
  servers?: Array<{
    url: string;
    description?: string;
    variables?: { [key: string]: { default: string; description?: string; enum?: string[] } };
  }>;
  tags?: Array<{
    name: string;
    description?: string;
  }>;
  paths?: any;
  components?: any;
}

/**
 * Interface for different API specification parsers
 */
interface IApiSpecFormatParser {
  canParse(source: string, sourceType: ApiSpecSourceType): boolean;
  parse(content: string): ApiSpec;
  getSupportedExtensions(): string[];
}

/**
 * Enum for different source types
 */
export enum ApiSpecSourceType {
  FILE_PATH = 'file_path',
  CONTENT_STRING = 'content_string',
  URL = 'url',
  BUFFER = 'buffer'
}

/**
 * YAML format parser
 */
class YamlApiSpecParser implements IApiSpecFormatParser {
  canParse(source: string, sourceType: ApiSpecSourceType): boolean {
    if (sourceType === ApiSpecSourceType.FILE_PATH) {
      const ext = path.extname(source).toLowerCase();
      return ext === '.yaml' || ext === '.yml';
    }
    if (sourceType === ApiSpecSourceType.CONTENT_STRING) {
      // Simple heuristic: check if content starts with typical YAML patterns
      const trimmed = source.trim();
      return trimmed.startsWith('openapi:') || 
             trimmed.startsWith('swagger:') || 
             trimmed.includes(':\n') || 
             trimmed.includes('- ');
    }
    return false;
  }

  parse(content: string): ApiSpec {
    try {
      return yaml.load(content) as ApiSpec;
    } catch (error) {
      throw new Error(`Failed to parse YAML content: ${error}`);
    }
  }

  getSupportedExtensions(): string[] {
    return ['.yaml', '.yml'];
  }
}

/**
 * JSON format parser
 */
class JsonApiSpecParser implements IApiSpecFormatParser {
  canParse(source: string, sourceType: ApiSpecSourceType): boolean {
    if (sourceType === ApiSpecSourceType.FILE_PATH) {
      const ext = path.extname(source).toLowerCase();
      return ext === '.json';
    }
    if (sourceType === ApiSpecSourceType.CONTENT_STRING) {
      const trimmed = source.trim();
      return trimmed.startsWith('{') && trimmed.endsWith('}');
    }
    return false;
  }

  parse(content: string): ApiSpec {
    try {
      return JSON.parse(content) as ApiSpec;
    } catch (error) {
      throw new Error(`Failed to parse JSON content: ${error}`);
    }
  }

  getSupportedExtensions(): string[] {
    return ['.json'];
  }
}

/**
 * Factory class for creating ApiSpecParser instances
 * Implements the Factory Pattern to create parsers based on source type and format
 */
export class ApiSpecParserFactory {
  private static formatParsers: IApiSpecFormatParser[] = [
    new YamlApiSpecParser(),
    new JsonApiSpecParser()
  ];

  /**
   * Create parser from file path
   */
  static createFromFile(filePath: string, options?: ApiSpecParserOptions): ApiSpecParser {
    return new ApiSpecParser(
      filePath,
      ApiSpecSourceType.FILE_PATH,
      this.formatParsers,
      options?.validationEnabled ?? true,
      options?.cacheEnabled ?? true
    );
  }

  /**
   * Create parser from content string
   */
  static createFromContent(content: string, options?: ApiSpecParserOptions): ApiSpecParser {
    return new ApiSpecParser(
      content,
      ApiSpecSourceType.CONTENT_STRING,
      this.formatParsers,
      options?.validationEnabled ?? true,
      options?.cacheEnabled ?? true
    );
  }

  /**
   * Create parser from URL (for future implementation)
   */
  static createFromUrl(url: string, options?: ApiSpecParserOptions): ApiSpecParser {
    return new ApiSpecParser(
      url,
      ApiSpecSourceType.URL,
      this.formatParsers,
      options?.validationEnabled ?? true,
      options?.cacheEnabled ?? true
    );
  }

  /**
   * Create parser with custom format parsers
   */
  static createWithCustomParsers(
    source: string,
    sourceType: ApiSpecSourceType,
    customParsers: IApiSpecFormatParser[],
    options?: ApiSpecParserOptions
  ): ApiSpecParser {
    const allParsers = [...this.formatParsers, ...customParsers];
    return new ApiSpecParser(
      source,
      sourceType,
      allParsers,
      options?.validationEnabled ?? true,
      options?.cacheEnabled ?? true
    );
  }

  /**
   * Register a new format parser globally
   */
  static registerFormatParser(parser: IApiSpecFormatParser): void {
    this.formatParsers.push(parser);
  }

  /**
   * Get all supported file extensions
   */
  static getSupportedExtensions(): string[] {
    return this.formatParsers.flatMap(parser => parser.getSupportedExtensions());
  }

  /**
   * Get all registered format parsers
   */
  static getRegisteredParsers(): IApiSpecFormatParser[] {
    return [...this.formatParsers];
  }

  /**
   * Auto-detect and create appropriate parser based on source
   */
  static createAuto(source: string, sourceType: ApiSpecSourceType, options?: ApiSpecParserOptions): ApiSpecParser {
    // Find the most appropriate parser for the source
    const parser = this.formatParsers.find(p => p.canParse(source, sourceType));
    
    if (!parser) {
      const supportedExts = this.getSupportedExtensions();
      throw new Error(`Cannot auto-detect format for source. Supported extensions: ${supportedExts.join(', ')}`);
    }

    return new ApiSpecParser(
      source,
      sourceType,
      this.formatParsers,
      options?.validationEnabled ?? true,
      options?.cacheEnabled ?? true
    );
  }
}

/**
 * Options interface for ApiSpecParser configuration
 */
export interface ApiSpecParserOptions {
  validationEnabled?: boolean;
  cacheEnabled?: boolean;
}

export class ApiSpecParser {
  private source: string;
  private sourceType: ApiSpecSourceType;
  private formatParsers: IApiSpecFormatParser[];
  private validationEnabled: boolean;
  private cacheEnabled: boolean;
  private apiSpec: ApiSpec | null = null;

  constructor(
    source: string,
    sourceType: ApiSpecSourceType,
    formatParsers: IApiSpecFormatParser[],
    validationEnabled: boolean = true,
    cacheEnabled: boolean = true
  ) {
    this.source = source;
    this.sourceType = sourceType;
    this.formatParsers = formatParsers;
    this.validationEnabled = validationEnabled;
    this.cacheEnabled = cacheEnabled;
  }

  /**
   * Legacy constructor for backward compatibility
   */
  static fromFile(filePath: string): ApiSpecParser {
    return ApiSpecParserFactory.createFromFile(filePath);
  }

  /**
   * Parse the API specification
   */
  parseApiSpec(): ApiSpec {
    if (this.cacheEnabled && this.apiSpec) {
      return this.apiSpec;
    }

    try {
      let content: string;

      // Get content based on source type
      if (this.sourceType === ApiSpecSourceType.FILE_PATH) {
        content = fs.readFileSync(this.source, 'utf8');
      } else if (this.sourceType === ApiSpecSourceType.CONTENT_STRING) {
        content = this.source;
      } else if (this.sourceType === ApiSpecSourceType.URL) {
        throw new Error('URL source type not yet implemented');
      } else {
        throw new Error(`Unsupported source type: ${this.sourceType}`);
      }

      // Find appropriate parser
      const parser = this.formatParsers.find(p => p.canParse(this.source, this.sourceType));
      if (!parser) {
        const supportedExts = this.formatParsers.flatMap(p => p.getSupportedExtensions());
        throw new Error(`Unsupported format. Supported extensions: ${supportedExts.join(', ')}`);
      }

      // Parse content
      this.apiSpec = parser.parse(content);

      // Validate if enabled
      if (this.validationEnabled) {
        this.validateApiSpec(this.apiSpec);
      }

      return this.apiSpec;
    } catch (error) {
      throw new Error(`Failed to parse API specification: ${error}`);
    }
  }

  /**
   * Validate the parsed API specification
   */
  private validateApiSpec(spec: ApiSpec): void {
    if (!spec || !spec.info) {
      throw new Error('Invalid API specification: missing info section');
    }
    if (!spec.info.title) {
      throw new Error('Invalid API specification: missing title in info section');
    }
    if (!spec.info.version) {
      throw new Error('Invalid API specification: missing version in info section');
    }
  }

  /**
   * Get API title from the specification
   */
  getApiTitle(): string {
    const spec = this.parseApiSpec();
    return spec.info.title;
  }

  /**
   * Get API version from the specification
   */
  getApiVersion(): string {
    const spec = this.parseApiSpec();
    return spec.info.version;
  }

  /**
   * Get API description from the specification
   */
  getApiDescription(): string | undefined {
    const spec = this.parseApiSpec();
    return spec.info.description;
  }

  /**
   * Get API terms of service from the specification
   */
  getTermsOfService(): string | undefined {
    const spec = this.parseApiSpec();
    return spec.info.termsOfService;
  }

  /**
   * Get contact information from the specification
   */
  getContactInfo(): { name?: string; email?: string; url?: string } | undefined {
    const spec = this.parseApiSpec();
    return spec.info.contact;
  }

  /**
   * Get license information from the specification
   */
  getLicenseInfo(): { name?: string; url?: string } | undefined {
    const spec = this.parseApiSpec();
    return spec.info.license;
  }

  /**
   * Get server information from the specification
   */
  getServers(): Array<{ url: string; description?: string }> {
    const spec = this.parseApiSpec();
    return spec.servers || [];
  }

  /**
   * Get tags from the specification
   */
  getTags(): Array<{ name: string; description?: string }> {
    const spec = this.parseApiSpec();
    return spec.tags || [];
  }

  /**
   * Get all endpoint paths from the specification
   */
  getEndpointPaths(): string[] {
    const spec = this.parseApiSpec();
    return spec.paths ? Object.keys(spec.paths) : [];
  }

  /**
   * Get HTTP methods for a specific path
   */
  getEndpointMethods(path: string): string[] {
    const spec = this.parseApiSpec();
    if (!spec.paths || !spec.paths[path]) {
      return [];
    }
    return Object.keys(spec.paths[path]);
  }

  /**
   * Get endpoint summary for a specific path and method
   */
  getEndpointSummary(path: string, method: string): string | undefined {
    const spec = this.parseApiSpec();
    if (!spec.paths || !spec.paths[path] || !spec.paths[path][method]) {
      return undefined;
    }
    return spec.paths[path][method].summary;
  }

  /**
   * Get endpoint description for a specific path and method
   */
  getEndpointDescription(path: string, method: string): string | undefined {
    const spec = this.parseApiSpec();
    if (!spec.paths || !spec.paths[path] || !spec.paths[path][method]) {
      return undefined;
    }
    return spec.paths[path][method].description;
  }

  /**
   * Get parameters for a specific endpoint
   */
  getEndpointParameters(path: string, method: string): any[] {
    const spec = this.parseApiSpec();
    if (!spec.paths || !spec.paths[path] || !spec.paths[path][method]) {
      return [];
    }
    return spec.paths[path][method].parameters || [];
  }

  /**
   * Get responses for a specific endpoint
   */
  getEndpointResponses(path: string, method: string): any {
    const spec = this.parseApiSpec();
    if (!spec.paths || !spec.paths[path] || !spec.paths[path][method]) {
      return {};
    }
    return spec.paths[path][method].responses || {};
  }

  /**
   * Get components/schemas from the specification
   */
  getSchemas(): any {
    const spec = this.parseApiSpec();
    return spec.components?.schemas || {};
  }

  /**
   * Get a specific schema by name
   */
  getSchema(schemaName: string): any {
    const schemas = this.getSchemas();
    return schemas[schemaName];
  }

  /**
   * Get schema properties for a specific schema
   */
  getSchemaProperties(schemaName: string): any {
    const schema = this.getSchema(schemaName);
    return schema?.properties || {};
  }

  /**
   * Get security schemes from the specification
   */
  getSecuritySchemes(): any {
    const spec = this.parseApiSpec();
    return spec.components?.securitySchemes || {};
  }

  /**
   * Get security requirements for a specific endpoint
   */
  getEndpointSecurity(path: string, method: string): any[] {
    const spec = this.parseApiSpec();
    if (!spec.paths || !spec.paths[path] || !spec.paths[path][method]) {
      return [];
    }
    return spec.paths[path][method].security || [];
  }

  /**
   * Get OAuth flow information for a security scheme
   */
  getOAuthFlows(schemeName: string): any {
    const securitySchemes = this.getSecuritySchemes();
    const scheme = securitySchemes[schemeName];
    return scheme?.flows || {};
  }

  /**
   * Get scopes for a specific OAuth flow
   */
  getOAuthScopes(schemeName: string, flowType: string): any {
    const flows = this.getOAuthFlows(schemeName);
    return flows[flowType]?.scopes || {};
  }

  /**
   * Get response headers for a specific endpoint and response code
   */
  getResponseHeaders(path: string, method: string, responseCode: string): any {
    const responses = this.getEndpointResponses(path, method);
    return responses[responseCode]?.headers || {};
  }

  /**
   * Get response schema for a specific endpoint, response code, and media type
   */
  getResponseSchema(path: string, method: string, responseCode: string, mediaType: string = 'application/json'): any {
    const responses = this.getEndpointResponses(path, method);
    return responses[responseCode]?.content?.[mediaType]?.schema || {};
  }

  /**
   * Get response description for a specific response code
   */
  getResponseDescription(path: string, method: string, responseCode: string): string | undefined {
    const responses = this.getEndpointResponses(path, method);
    return responses[responseCode]?.description;
  }

  /**
   * Get all media types for a specific response
   */
  getResponseMediaTypes(path: string, method: string, responseCode: string): string[] {
    const responses = this.getEndpointResponses(path, method);
    const content = responses[responseCode]?.content || {};
    return Object.keys(content);
  }
}
