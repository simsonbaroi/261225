// Frontend utilities for using permanent categories
import { 
  OUTPATIENT_CATEGORIES, 
  INPATIENT_CATEGORIES, 
  DEFAULT_OUTPATIENT_ITEMS, 
  DEFAULT_INPATIENT_ITEMS,
  getCategoryInterface,
  getCategoryOrder,
  getOrderedCategories,
  getDefaultItems
} from "@shared/categories";

// Re-export for frontend use
export {
  OUTPATIENT_CATEGORIES,
  INPATIENT_CATEGORIES,
  DEFAULT_OUTPATIENT_ITEMS,
  DEFAULT_INPATIENT_ITEMS,
  getCategoryInterface,
  getCategoryOrder,
  getOrderedCategories,
  getDefaultItems
};

// Get categories that should be displayed (filtered and ordered)
export const getDisplayCategories = (isOutpatient: boolean) => {
  const allCategories = getOrderedCategories(isOutpatient);
  
  if (!isOutpatient) {
    // Filter out excluded categories for inpatient
    const excludedCategories = ['Dr. Fees', 'Medic Fee', 'Medicine'];
    return allCategories.filter(cat => !excludedCategories.includes(cat.name));
  }
  
  return allCategories;
};

// Get category names only for compatibility with existing code
export const getCategoryNames = (isOutpatient: boolean) => {
  return getDisplayCategories(isOutpatient).map(cat => cat.name);
};

// Check if a category has a specific interface type
export const categoryHasInterface = (categoryName: string, isOutpatient: boolean, interfaceType: string) => {
  return getCategoryInterface(categoryName, isOutpatient) === interfaceType;
};

// Get categories by interface type
export const getCategoriesByInterface = (isOutpatient: boolean, interfaceType: string) => {
  return getDisplayCategories(isOutpatient).filter(cat => cat.interface === interfaceType);
};