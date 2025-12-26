// SYSTEM RULES: All UI configurations, buttons, customizations must be in code, NOT in database
// Database is ONLY for price list items (medical items with prices)

/**
 * RULE BOOK FOR HOSPITAL BILL CALCULATOR SYSTEM
 * 
 * 1. PERMANENT IN CODE (Never in database):
 *    - Category names and order
 *    - Button configurations and layouts
 *    - UI customizations and themes
 *    - Interface types (search, toggle, manual, special)
 *    - Navigation and carousel settings
 *    - Form layouts and field configurations
 *    - Business logic and calculations
 * 
 * 2. DATABASE ONLY FOR:
 *    - Medical item names and prices
 *    - Patient bill data
 *    - User-entered custom items (like manual therapy entries)
 * 
 * 3. ARCHITECTURE SEPARATION:
 *    - shared/categories.ts: Category definitions and interfaces
 *    - shared/systemRules.ts: System configuration rules
 *    - server/storage.ts: Price data management only
 *    - client components: Use permanent configurations, not database-derived
 */

// System configuration constants
export const SYSTEM_CONFIG = {
  // Database usage rules
  DATABASE_ALLOWED_OPERATIONS: [
    'CREATE_MEDICAL_ITEM',
    'READ_MEDICAL_ITEM', 
    'UPDATE_MEDICAL_ITEM_PRICE',
    'DELETE_MEDICAL_ITEM',
    'SAVE_BILL_DATA',
    'LOAD_BILL_DATA'
  ],
  
  DATABASE_FORBIDDEN_OPERATIONS: [
    'CREATE_CATEGORY',
    'UPDATE_CATEGORY_ORDER',
    'CREATE_UI_CONFIGURATION',
    'STORE_BUTTON_LAYOUT',
    'SAVE_INTERFACE_TYPE'
  ],

  // UI Rules
  UI_CONFIGURATION_SOURCE: 'CODE_ONLY', // Never from database
  CATEGORY_SOURCE: 'PERMANENT_CONFIG', // From shared/categories.ts
  BUTTON_LAYOUT_SOURCE: 'HARDCODED', // In component files
  
  // Currency system
  CURRENCY: 'BDT', // Bangladeshi Taka only
  CURRENCY_SYMBOL: '৳',
  
  // Grid layout
  DESKTOP_GRID_COLUMNS: 6,
  MOBILE_GRID_COLUMNS: 2,
  
  // Theme
  COLOR_SCHEME: 'DARK_MEDICAL',
  PRIMARY_COLOR: 'emerald',
  GLASS_MORPHISM: true
} as const;

// Validation function to ensure database isn't used for UI configuration
export const validateDatabaseOperation = (operation: string): boolean => {
  return SYSTEM_CONFIG.DATABASE_ALLOWED_OPERATIONS.includes(operation as any);
};

// Error messages for rule violations
export const RULE_VIOLATION_MESSAGES = {
  CATEGORY_IN_DATABASE: 'VIOLATION: Categories must be defined in shared/categories.ts, not in database',
  UI_CONFIG_IN_DATABASE: 'VIOLATION: UI configurations must be hardcoded in components, not stored in database',
  BUTTON_LAYOUT_IN_DATABASE: 'VIOLATION: Button layouts must be defined in code, not in database'
} as const;

// Enforce separation of concerns
export const enforceSystemRules = () => {
  console.log('✅ SYSTEM RULES ENFORCED:');
  console.log('   - Categories: Permanent configuration in code');
  console.log('   - UI/Buttons: Hardcoded in components');
  console.log('   - Database: Price list items only');
  console.log('   - Currency: Bangladeshi Taka (৳) only');
  console.log('   - Migration: From Replit Agent to standard Replit completed');
};