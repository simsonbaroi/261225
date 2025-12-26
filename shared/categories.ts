// Permanent medical categories and structure - not stored in database
// These categories, order, and UI configurations will never be lost

export interface CategoryConfig {
  name: string;
  order: number;
  hasSearch?: boolean;
  hasDropdown?: boolean;
  hasManualEntry?: boolean;
  hasSpecialInterface?: boolean; // For medicine dosage, x-ray films, etc.
  interface?: 'search' | 'dropdown' | 'manual' | 'toggle' | 'special';
  description?: string;
}

// Outpatient Categories - permanent configuration
export const OUTPATIENT_CATEGORIES: CategoryConfig[] = [
  { name: 'Registration Fees', order: 1, interface: 'toggle', description: 'Click to add/remove items' },
  { name: 'Dr. Fees', order: 2, interface: 'toggle', description: 'Doctor consultation fees' },
  { name: 'Medic Fee', order: 3, interface: 'toggle', description: 'Medical service fees' },
  { name: 'Laboratory', order: 4, interface: 'search', hasSearch: true, hasDropdown: true, description: 'Lab tests with search and dropdown' },
  { name: 'X-Ray', order: 5, interface: 'special', hasSearch: true, hasDropdown: true, description: 'X-Ray services with film selection' },
  { name: 'Medicine', order: 6, interface: 'special', hasSearch: true, hasDropdown: true, description: 'Medicine with dosage calculator' },
  { name: 'Physical Therapy', order: 7, interface: 'manual', hasManualEntry: true, description: 'Enter custom PT services and prices' },
  { name: 'Limb and Brace', order: 8, interface: 'manual', hasManualEntry: true, description: 'Enter orthopedic devices and prices' },
];

// Inpatient Categories - permanent configuration
export const INPATIENT_CATEGORIES: CategoryConfig[] = [
  { name: 'Blood', order: 1, interface: 'dropdown', hasDropdown: true, description: 'Blood services and transfusions with quantity controls' },
  { name: 'Laboratory', order: 2, interface: 'search', hasSearch: true, hasDropdown: true, description: 'Lab tests with search and dropdown' },
  { name: 'Limb and Brace', order: 3, interface: 'manual', hasManualEntry: true, description: 'Orthopedic devices and braces' },
  { name: 'Food', order: 4, interface: 'manual', hasManualEntry: true, description: 'Hospital meal services' },
  { name: 'Halo, O2, NO2, etc.', order: 5, interface: 'search', hasSearch: true, hasDropdown: true, description: 'Respiratory and traction services' },
  { name: 'Orthopedic, S.Roll, etc.', order: 6, interface: 'search', hasSearch: true, hasDropdown: true, description: 'Orthopedic consultations and support' },
  { name: 'Surgery, O.R. & Delivery', order: 7, interface: 'search', hasSearch: true, hasDropdown: true, description: 'Surgical procedures and delivery' },
  { name: 'Registration Fees', order: 8, interface: 'toggle', description: 'Admission and registration fees' },
  { name: 'Discharge Medicine', order: 9, interface: 'special', hasSearch: true, hasDropdown: true, description: 'Discharge medications with dosage' },
  { name: 'Medicine, ORS & Anesthesia, Ket, Spinal', order: 10, interface: 'search', hasSearch: true, hasDropdown: true, description: 'Anesthesia and ORS solutions' },
  { name: 'Physical Therapy', order: 11, interface: 'manual', hasManualEntry: true, description: 'Physical therapy sessions' },
  { name: 'IV.\'s', order: 12, interface: 'special', hasSearch: true, hasDropdown: true, description: 'IV fluids and medications with quantity' },
  { name: 'Plaster/Milk', order: 13, interface: 'search', hasSearch: true, hasDropdown: true, description: 'Casting and nutrition services' },
  { name: 'Procedures', order: 14, interface: 'search', hasSearch: true, hasDropdown: true, description: 'Medical procedures' },
  { name: 'Seat & Ad. Fee', order: 15, interface: 'search', hasSearch: true, hasDropdown: true, description: 'Seating and additional fees' },
  { name: 'X-Ray', order: 16, interface: 'special', hasSearch: true, hasDropdown: true, description: 'X-Ray services with film selection' },
  { name: 'Lost Laundry', order: 17, interface: 'search', hasSearch: true, hasDropdown: true, description: 'Laundry replacement charges' },
  { name: 'Travel', order: 18, interface: 'search', hasSearch: true, hasDropdown: true, description: 'Travel and transport services' },
  { name: 'Others', order: 19, interface: 'search', hasSearch: true, hasDropdown: true, description: 'Miscellaneous services' },
];

// Default items for each category - these are templates, actual prices come from database
export const DEFAULT_OUTPATIENT_ITEMS = {
  'Registration Fees': [
    { name: 'Outpatient Registration', description: 'Basic registration fee' },
    { name: 'Emergency Registration', description: 'Emergency room registration' },
    { name: 'Admission Fee', description: 'Hospital admission fee' },
    { name: 'ICU Admission', description: 'Intensive care unit admission' },
  ],
  'Dr. Fees': [
    { name: 'General Consultation', description: 'General practitioner consultation' },
    { name: 'Specialist Consultation', description: 'Specialist doctor consultation' },
    { name: 'Emergency Consultation', description: 'Emergency medical consultation' },
  ],
  'Medic Fee': [
    { name: 'Basic Medical Service', description: 'Standard medical services' },
    { name: 'Advanced Medical Service', description: 'Specialized medical services' },
    { name: 'Emergency Medical Service', description: 'Emergency medical response' },
  ],
  'Laboratory': [
    { name: 'Complete Blood Count', description: 'CBC test' },
    { name: 'Urinalysis', description: 'Urine examination' },
    { name: 'Blood Chemistry', description: 'Blood chemistry panel' },
    { name: 'Liver Function Test', description: 'LFT panel' },
    { name: 'Kidney Function Test', description: 'KFT panel' },
    { name: 'Lipid Profile', description: 'Cholesterol and lipids' },
    { name: 'Thyroid Function Test', description: 'T3, T4, TSH' },
    { name: 'Blood Sugar', description: 'Glucose level test' },
    { name: 'HbA1c', description: '3-month glucose average' },
    { name: 'ESR', description: 'Erythrocyte sedimentation rate' },
  ],
  'X-Ray': [
    { name: 'Chest X-Ray', description: 'Chest imaging' },
    { name: 'Extremity X-Ray', description: 'Arms and legs imaging' },
    { name: 'Spine X-Ray', description: 'Spinal imaging' },
    { name: 'Abdomen X-Ray', description: 'Abdominal imaging' },
    { name: 'Pelvis X-Ray', description: 'Pelvic imaging' },
  ],
  'Medicine': [
    { name: 'Paracetamol 500mg', description: 'Pain reliever' },
    { name: 'Aspirin 75mg', description: 'Blood thinner' },
    { name: 'Amoxicillin 500mg', description: 'Antibiotic' },
    { name: 'Ibuprofen 400mg', description: 'Anti-inflammatory' },
    { name: 'Omeprazole 20mg', description: 'Acid reducer' },
    { name: 'Cetirizine 10mg', description: 'Antihistamine' },
    { name: 'Metformin 500mg', description: 'Diabetes medication' },
    { name: 'Amlodipine 5mg', description: 'Blood pressure medication' },
    { name: 'Atorvastatin 20mg', description: 'Cholesterol medication' },
    { name: 'Azithromycin 500mg', description: 'Antibiotic' },
  ],
  'Physical Therapy': [],
  'Limb and Brace': [],
};

export const DEFAULT_INPATIENT_ITEMS = {
  'Blood': [
    { name: 'Whole Blood (1 unit)', description: 'Complete blood transfusion' },
    { name: 'Packed Red Blood Cells (1 unit)', description: 'Concentrated red blood cells' },
    { name: 'Fresh Frozen Plasma (1 unit)', description: 'Plasma for clotting factors' },
    { name: 'Platelet Concentrate (1 unit)', description: 'Concentrated platelets' },
    { name: 'Cryoprecipitate (1 unit)', description: 'Clotting factor concentrate' },
    { name: 'Blood Cross-Match Test', description: 'Compatibility testing' },
    { name: 'Blood Typing & Rh Factor', description: 'Blood group determination' },
    { name: 'Direct Coombs Test', description: 'Antibody detection test' },
  ],
  'Laboratory': [
    { name: 'Complete Blood Count', description: 'CBC test - inpatient' },
    { name: 'Blood Chemistry Panel', description: 'Comprehensive metabolic panel' },
    { name: 'Liver Function Test', description: 'LFT panel - inpatient' },
    { name: 'Kidney Function Test', description: 'KFT panel - inpatient' },
    { name: 'Cardiac Enzymes', description: 'Heart function markers' },
    { name: 'Coagulation Studies', description: 'Blood clotting tests' },
    { name: 'Blood Gas Analysis', description: 'Arterial blood gas' },
    { name: 'Electrolyte Panel', description: 'Sodium, potassium, chloride' },
  ],
  'Limb and Brace': [],
  'Food': [],
  'Halo, O2, NO2, etc.': [
    { name: 'Oxygen Therapy (per day)', description: 'Daily oxygen supply' },
    { name: 'Nitrous Oxide', description: 'Medical gas therapy' },
    { name: 'Halo Traction', description: 'Cervical traction device' },
    { name: 'CPAP Machine (per day)', description: 'Continuous positive airway pressure' },
  ],
  'Orthopedic, S.Roll, etc.': [
    { name: 'Orthopedic Consultation', description: 'Specialist consultation' },
    { name: 'Spinal Roll Support', description: 'Spinal positioning aid' },
    { name: 'Orthopedic Brace', description: 'Therapeutic bracing' },
    { name: 'Spine Support System', description: 'Comprehensive spine support' },
    { name: 'Orthopedic Device Setup', description: 'Device installation and setup' },
  ],
  'Surgery, O.R. & Delivery': [
    { name: 'Minor Surgery', description: 'Outpatient surgical procedures' },
    { name: 'Major Surgery', description: 'Complex surgical procedures' },
    { name: 'Normal Delivery', description: 'Vaginal delivery' },
    { name: 'C-Section Delivery', description: 'Cesarean section' },
    { name: 'Operating Room Fee', description: 'OR usage charges' },
    { name: 'Anesthesia Fee', description: 'Anesthesia services' },
  ],
  'Registration Fees': [
    { name: 'Admission Fee', description: 'Hospital admission' },
    { name: 'ICU Admission', description: 'ICU admission fee' },
    { name: 'Private Room Fee', description: 'Private room upgrade' },
    { name: 'Semi-Private Room Fee', description: 'Semi-private accommodation' },
  ],
  'Discharge Medicine': [
    { name: 'Discharge Medication Package', description: 'Standard discharge meds' },
    { name: 'Pain Relief Package', description: 'Post-surgical pain management' },
    { name: 'Antibiotic Course', description: 'Complete antibiotic treatment' },
    { name: 'Chronic Disease Package', description: 'Long-term medication supply' },
  ],
  'Medicine, ORS & Anesthesia, Ket, Spinal': [
    { name: 'ORS Solution', description: 'Oral rehydration salt' },
    { name: 'Ketamine Injection', description: 'Anesthetic agent' },
    { name: 'Spinal Anesthesia', description: 'Regional anesthesia' },
    { name: 'Local Anesthesia', description: 'Topical numbing agent' },
    { name: 'IV Anesthesia', description: 'Intravenous anesthesia' },
  ],
  'Physical Therapy': [],
  'IV.\'s': [
    { name: 'Normal Saline IV', description: '0.9% sodium chloride' },
    { name: 'Dextrose 5% IV', description: 'D5W solution' },
    { name: 'Lactated Ringers IV', description: 'Balanced electrolyte solution' },
    { name: 'Potassium IV', description: 'Potassium supplementation' },
  ],
  'Plaster/Milk': [
    { name: 'Plaster Cast', description: 'Bone fracture immobilization' },
    { name: 'Fiberglass Cast', description: 'Lightweight casting material' },
    { name: 'Milk Formula', description: 'Infant nutrition' },
    { name: 'Nutritional Supplement', description: 'Dietary supplementation' },
  ],
  'Procedures': [
    { name: 'Central Line Insertion', description: 'Central venous access' },
    { name: 'Chest Tube Insertion', description: 'Thoracic drainage' },
    { name: 'Urinary Catheterization', description: 'Bladder drainage' },
    { name: 'Wound Dressing', description: 'Wound care and dressing' },
  ],
  'Seat & Ad. Fee': [
    { name: 'Wheelchair Fee', description: 'Wheelchair usage charge' },
    { name: 'Hospital Bed Fee', description: 'Daily bed charge' },
    { name: 'Visitor Chair Fee', description: 'Additional seating' },
    { name: 'Administrative Fee', description: 'Hospital administrative costs' },
  ],
  'X-Ray': [
    { name: 'Chest X-Ray', description: 'Chest imaging - inpatient' },
    { name: 'Extremity X-Ray', description: 'Arms and legs imaging - inpatient' },
    { name: 'Spine X-Ray', description: 'Spinal imaging - inpatient' },
    { name: 'Abdomen X-Ray', description: 'Abdominal imaging - inpatient' },
    { name: 'Pelvis X-Ray', description: 'Pelvic imaging - inpatient' },
  ],
  'Lost Laundry': [
    { name: 'Lost Bed Sheet', description: 'Replacement bed linen' },
    { name: 'Lost Towel', description: 'Replacement towel' },
    { name: 'Lost Hospital Gown', description: 'Replacement patient gown' },
    { name: 'Lost Blanket', description: 'Replacement blanket' },
  ],
  'Travel': [
    { name: 'Ambulance Service', description: 'Emergency transport' },
    { name: 'Patient Transport', description: 'Inter-hospital transfer' },
    { name: 'Medical Escort', description: 'Accompanied patient transport' },
    { name: 'Travel Insurance', description: 'Medical travel coverage' },
  ],
  'Others': [
    { name: 'Telephone Charges', description: 'Patient phone usage' },
    { name: 'Television Fee', description: 'Entertainment services' },
    { name: 'WiFi Access', description: 'Internet connectivity' },
    { name: 'Medical Records Fee', description: 'Document processing' },
  ],
};

// Carousel configuration - permanent settings
export const CAROUSEL_CONFIG = {
  showPreviewButtons: true,
  enableSwipeGesture: true,
  exitButtonPosition: 'top-right',
  navigationArrowSize: 'large',
  cardMinHeight: '300px',
  gridColumns: 6, // 6 buttons per row
  mobileGridColumns: 2, // 2 buttons per row on mobile
};

// Interface type helpers
export const getCategoryInterface = (categoryName: string, isOutpatient: boolean) => {
  const categories = isOutpatient ? OUTPATIENT_CATEGORIES : INPATIENT_CATEGORIES;
  const category = categories.find(cat => cat.name === categoryName);
  return category?.interface || 'search';
};

export const getCategoryOrder = (categoryName: string, isOutpatient: boolean) => {
  const categories = isOutpatient ? OUTPATIENT_CATEGORIES : INPATIENT_CATEGORIES;
  const category = categories.find(cat => cat.name === categoryName);
  return category?.order || 999;
};

export const getOrderedCategories = (isOutpatient: boolean) => {
  const categories = isOutpatient ? OUTPATIENT_CATEGORIES : INPATIENT_CATEGORIES;
  return categories.sort((a, b) => a.order - b.order);
};

export const getDefaultItems = (categoryName: string, isOutpatient: boolean) => {
  const items = isOutpatient ? DEFAULT_OUTPATIENT_ITEMS : DEFAULT_INPATIENT_ITEMS;
  return items[categoryName as keyof typeof items] || [];
};