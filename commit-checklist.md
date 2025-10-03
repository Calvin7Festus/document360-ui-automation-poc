# Git Commit Checklist

## ✅ Files to Commit (Essential)

### Core Configuration
- [ ] package.json
- [ ] package-lock.json  
- [ ] playwright.config.ts
- [ ] README.md
- [ ] .gitignore
- [ ] .env.example

### Source Code - Commons
- [ ] src/commons/ui-actions.ts

### Source Code - Configuration  
- [ ] src/config/test-data.config.ts

### Source Code - Page Factory
- [ ] src/page-factory/components/header.component.ts
- [ ] src/page-factory/components/new-api-creation.modal.ts
- [ ] src/page-factory/components/toast-message.component.ts
- [ ] src/page-factory/pages/api-doc.page.ts
- [ ] src/page-factory/pages/login.page.ts

### Source Code - Setup
- [ ] src/setup/global-setup.ts

### Source Code - Tests
- [ ] src/tests/e2e/api-content/category-2-ui-validation-tests.spec.ts
- [ ] src/tests/e2e/api-import/category-1-import-tests.spec.ts
- [ ] src/tests/e2e/customer-portal/category-3-customer-portal-tests.spec.ts

### Source Code - Utils (Including New Logger)
- [ ] src/utils/api-helper.ts
- [ ] src/utils/api-response-observer.ts
- [ ] src/utils/api-spec-parser-examples.ts
- [ ] src/utils/api-spec-parser.ts
- [ ] src/utils/config-manager.ts
- [ ] src/utils/import-test-setup-manager.ts
- [ ] src/utils/index.ts
- [ ] src/utils/logger.ts (NEW)
- [ ] src/utils/logger-factory.ts (NEW)
- [ ] src/utils/logger-examples.ts (NEW)
- [ ] src/utils/test-setup-manager.ts
- [ ] src/utils/validation-strategy.ts

### Test Data
- [ ] test-data/valid-apis/comprehensive/comprehensive-api.yaml
- [ ] test-data/valid-apis/simple/simple-doc.yaml
- [ ] test-data/valid-apis/simple/simple-doc.json
- [ ] test-data/valid-apis/simple/simple-doc.yml
- [ ] test-data/valid-apis/minimal/minimal-api.yaml
- [ ] test-data/valid-apis/domain-specific/petstore-api.yaml
- [ ] test-data/valid-apis/domain-specific/ecommerce-api.json
- [ ] test-data/valid-apis/domain-specific/banking-api.yml
- [ ] test-data/format-specific/yaml/yaml-api.yaml
- [ ] test-data/format-specific/yaml/yml-api.yml
- [ ] test-data/format-specific/json/json-api.json
- [ ] test-data/invalid-apis/empty/empty-file.yaml
- [ ] test-data/invalid-apis/empty/invalid-yaml.yaml
- [ ] test-data/invalid-apis/malformed/invalid-json-structure.json
- [ ] test-data/invalid-apis/malformed/invalid-json.json
- [ ] test-data/invalid-apis/unsupported/invalid-file.txt

## ❌ Files to NEVER Commit

### Sensitive Data
- [ ] .env (contains credentials)
- [ ] storageState.json (contains auth tokens)

### Generated Files  
- [ ] node_modules/ (dependencies)
- [ ] test-results/ (test outputs)
- [ ] playwright-report/ (HTML reports)
- [ ] test-results/validation-screenshots/ (screenshots)

### System Files
- [ ] .DS_Store (macOS)
- [ ] *.log (log files)
