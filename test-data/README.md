# Test Data Structure

This directory contains organized test data files for the Document360 UI Automation Framework.

## 📁 Folder Structure

```
test-data/
├── valid-apis/                    # Valid OpenAPI specifications
│   ├── simple/                    # Basic APIs with minimal complexity
│   │   ├── simple-doc.yaml        # Hello World API (YAML)
│   │   ├── simple-doc.json        # Hello World API (JSON)
│   │   └── simple-doc.yml         # Hello World API (YML)
│   ├── comprehensive/             # Complex APIs with full features
│   │   └── comprehensive-api.yaml # Full-featured API with all elements
│   ├── domain-specific/           # Real-world domain APIs
│   │   ├── petstore-api.yaml      # Swagger Petstore API
│   │   ├── ecommerce-api.json     # E-commerce platform API
│   │   └── banking-api.yml        # Banking services API
│   └── minimal/                   # Minimal APIs for edge case testing
│       └── minimal-api.yaml       # API without description field
├── invalid-apis/                  # Invalid/error test cases
│   ├── empty/                     # Empty or incomplete files
│   │   ├── empty-file.yaml        # Completely empty file
│   │   └── invalid-yaml.yaml      # Malformed YAML syntax
│   ├── malformed/                 # Syntactically incorrect files
│   │   ├── invalid-json.json      # Invalid JSON syntax
│   │   └── invalid-json-structure.json # Valid JSON, invalid OpenAPI
│   └── unsupported/               # Unsupported file formats
│       └── invalid-file.txt       # Text file (not API spec)
└── format-specific/               # Format-specific test files
    ├── yaml/                      # YAML format testing
    │   ├── yaml-api.yaml          # YAML-specific features
    │   └── yml-api.yml            # YML extension testing
    └── json/                      # JSON format testing
        └── json-api.json          # JSON-specific features
```

## 🎯 Usage by Test Categories

### **Category 1: Import Tests**
- Uses: `valid-apis/simple/`, `valid-apis/domain-specific/`
- Purpose: Test API import functionality with various file formats
- Files: All simple APIs + domain-specific APIs

### **Category 2: UI Validation Tests**
- Uses: `valid-apis/comprehensive/`, `valid-apis/domain-specific/`
- Purpose: Validate UI elements and content display
- Files: Complex APIs with full feature sets

### **Category 3: Customer Portal Tests**
- Uses: `valid-apis/comprehensive/`, `valid-apis/domain-specific/`
- Purpose: Test customer portal functionality
- Files: APIs with external docs and server configurations

### **Error Handling Tests**
- Uses: `invalid-apis/`
- Purpose: Test error handling and validation
- Files: All invalid/malformed files

## 📊 File Categories

| **Category** | **Complexity** | **Use Case** | **Features** |
|--------------|----------------|--------------|--------------|
| **Simple** | Low | Basic import/validation | Minimal endpoints, basic info |
| **Comprehensive** | High | Full UI testing | All OpenAPI features |
| **Domain-Specific** | Medium-High | Real-world scenarios | Industry-specific APIs |
| **Minimal** | Low | Edge case testing | Missing optional fields |
| **Invalid** | N/A | Error handling | Malformed/unsupported files |

## 🔧 Adding New Test Data

1. **Determine Category**: Choose appropriate folder based on complexity and purpose
2. **Follow Naming**: Use descriptive names (e.g., `healthcare-api.yaml`)
3. **Update Provider**: Add entry to `TestDataProvider.TEST_DATA_REGISTRY`
4. **Document**: Update this README if adding new categories

## 🚀 Benefits

- **✅ Organized Structure**: Easy to find and manage test files
- **✅ Clear Categorization**: Files grouped by purpose and complexity
- **✅ Scalable**: Easy to add new categories and files
- **✅ Maintainable**: Clear separation of concerns
- **✅ Discoverable**: Self-documenting structure
