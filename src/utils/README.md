# Utils Module - Organized Structure

This directory contains all utility classes and functions organized by functionality and purpose.

## 📁 Folder Structure

```
src/utils/
├── api/                           # API-related utilities
│   ├── api-helper.ts             # API operations and tracking
│   ├── api-response-observer.ts  # Observer pattern for API responses
│   └── api-spec-parser.ts        # OpenAPI specification parsing
├── config/                       # Configuration management
│   └── config-manager.ts         # Singleton config manager
├── data/                         # Data management utilities
│   └── test-data-provider.ts     # Data-driven testing support
├── logging/                      # Logging infrastructure
│   ├── logger.ts                 # Core logger implementation
│   └── logger-factory.ts         # Logger factory and categories
├── test-setup/                   # Test setup and validation
│   ├── test-setup-manager.ts     # Test environment setup
│   └── validation-strategy.ts    # Validation strategies
├── ui/                          # UI-related utilities
│   └── locator-utils.ts         # Playwright locator helpers
└── index.ts                     # Centralized exports
```

## 🎯 Categories Explained

### **API Utilities (`api/`)**
- **`api-helper.ts`**: Core API operations, request tracking, cleanup management
- **`api-response-observer.ts`**: Observer pattern implementation for API response monitoring
- **`api-spec-parser.ts`**: OpenAPI/Swagger specification parsing and validation

### **Configuration (`config/`)**
- **`config-manager.ts`**: Singleton pattern for environment configuration management

### **Data Management (`data/`)**
- **`test-data-provider.ts`**: Data-driven testing support, test file management

### **Logging (`logging/`)**
- **`logger.ts`**: Core logging functionality with levels and formatting
- **`logger-factory.ts`**: Factory pattern for creating category-specific loggers

### **Test Setup (`test-setup/`)**
- **`test-setup-manager.ts`**: Complete test environment initialization and teardown
- **`validation-strategy.ts`**: Strategy pattern for different validation approaches

### **UI Utilities (`ui/`)**
- **`locator-utils.ts`**: Playwright locator helpers for robust element selection

## 🚀 Usage

### **Import from Categories**
```typescript
// API utilities
import { ApiHelper } from '../utils/api/api-helper';
import { ApiResponseObserver } from '../utils/api/api-response-observer';

// Configuration
import { ConfigManager } from '../utils/config/config-manager';

// Data management
import { getTestDataProvider } from '../utils/data/test-data-provider';

// Logging
import { loggers } from '../utils/logging/logger-factory';

// Test setup
import { TestSetupManager } from '../utils/test-setup/test-setup-manager';

// UI utilities
import { createSafeTextSelector } from '../utils/ui/locator-utils';
```

### **Import from Index (Centralized)**
```typescript
// All utilities available from single import
import {
  ApiHelper,
  ConfigManager,
  TestSetupManager,
  getTestDataProvider,
  loggers,
  createSafeTextSelector
} from '../utils';
```

## 🧹 Removed Files

The following unused/example files were removed during reorganization:

- ❌ `api-spec-parser-examples.ts` - Example code, not used in tests
- ❌ `logger-examples.ts` - Example code, not used in tests  
- ❌ `import-test-setup-manager.ts` - Duplicate functionality, unused

## 📊 Design Patterns Used

| **Pattern** | **Implementation** | **Location** |
|-------------|-------------------|--------------|
| **Singleton** | ConfigManager, Logger | `config/`, `logging/` |
| **Observer** | API Response Tracking | `api/api-response-observer.ts` |
| **Strategy** | Validation Approaches | `test-setup/validation-strategy.ts` |
| **Factory** | Logger Creation, API Parsers | `logging/logger-factory.ts`, `api/api-spec-parser.ts` |

## ✅ Benefits

- **🔍 Easy Discovery**: Find utilities by functionality
- **📦 Logical Grouping**: Related utilities are co-located
- **🧹 Clean Structure**: No unused or example files
- **📈 Scalable**: Easy to add new utilities in appropriate categories
- **🔧 Maintainable**: Clear separation of concerns
- **📚 Self-Documenting**: Structure explains purpose

## 🔄 Migration Impact

All import statements have been updated across the codebase:
- ✅ Test files (`src/tests/`)
- ✅ Page objects (`src/page-factory/`)
- ✅ Setup files (`src/setup/`)
- ✅ Internal utils cross-references

The centralized `index.ts` maintains backward compatibility for existing imports.
