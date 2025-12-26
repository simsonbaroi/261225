// Database management functions using localStorage
// This can be easily migrated to SQLite later

export interface DatabaseItem {
  id: string;
  category: string;
  name: string;
  price: number;
  description?: string;
  isOutpatient: boolean;
}

export interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

const STORAGE_KEY = 'hospital_database';
const BILLS_KEY = 'hospital_bills';

// Initialize default data
const defaultData: DatabaseItem[] = [
  // Outpatient items (ordered according to user specification)
  { id: '1', category: 'Registration', name: 'Outpatient Registration', price: 100, isOutpatient: true },
  { id: '2', category: 'Dr. Fee', name: 'General Consultation', price: 500, isOutpatient: true },
  { id: '3', category: 'Dr. Fee', name: 'Specialist Consultation', price: 800, isOutpatient: true },
  { id: '4', category: 'Medic Fee', name: 'Medical Assistant Fee', price: 200, isOutpatient: true },
  { id: '5', category: 'Off-Charge', name: 'Off-Charge/OB Check (Night)', price: 300, isOutpatient: true },
  { id: '6', category: 'Laboratory', name: 'Complete Blood Count', price: 250, isOutpatient: true },
  { id: '7', category: 'Laboratory', name: 'Urinalysis', price: 150, isOutpatient: true },
  { id: '8', category: 'Laboratory', name: 'Blood Chemistry', price: 400, isOutpatient: true },
  { id: '9', category: 'X-Ray', name: 'Chest X-Ray', price: 800, isOutpatient: true },
  { id: '10', category: 'X-Ray', name: 'Extremity X-Ray', price: 600, isOutpatient: true },
  { id: '11', category: 'Medicine', name: 'Paracetamol 500mg', price: 15, isOutpatient: true },
  { id: '12', category: 'Medicine', name: 'Antibiotic Prescription', price: 120, isOutpatient: true },
  { id: '13', category: 'Procedure', name: 'Minor Procedure', price: 1500, isOutpatient: true },
  { id: '14', category: 'Procedure', name: 'Injection Administration', price: 50, isOutpatient: true },
  { id: '15', category: 'O.R', name: 'Minor Outpatient Surgery', price: 5000, isOutpatient: true },
  { id: '16', category: 'Physical therapy', name: 'PT Session', price: 300, isOutpatient: true },
  { id: '17', category: 'Others', name: 'Miscellaneous Charges', price: 100, isOutpatient: true },
  
  // Inpatient items
  { id: '18', category: 'Blood', name: 'Blood Transfusion', price: 2500, isOutpatient: false },
  { id: '19', category: 'Laboratory', name: 'Complete Blood Count', price: 300, isOutpatient: false },
  { id: '20', category: 'Food', name: 'Regular Diet (per day)', price: 350, isOutpatient: false },
  { id: '21', category: 'Registration Fees', name: 'Admission Fee', price: 500, isOutpatient: false },
  { id: '22', category: 'Medicine', name: 'IV Antibiotics', price: 800, isOutpatient: false },
];

// Database operations
export const initializeDatabase = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  }
};

export const getAllItems = (): DatabaseItem[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getItemsByType = (isOutpatient: boolean): DatabaseItem[] => {
  return getAllItems().filter(item => item.isOutpatient === isOutpatient);
};

export const getItemsByCategory = (category: string, isOutpatient: boolean): DatabaseItem[] => {
  return getAllItems().filter(item => 
    item.category === category && item.isOutpatient === isOutpatient
  );
};

export const addItem = (item: Omit<DatabaseItem, 'id'>): DatabaseItem => {
  const items = getAllItems();
  const newItem = { ...item, id: Date.now().toString() };
  items.push(newItem);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return newItem;
};

export const updateItem = (id: string, updates: Partial<DatabaseItem>): void => {
  const items = getAllItems();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
};

export const deleteItem = (id: string): void => {
  const items = getAllItems().filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const searchItems = (query: string, isOutpatient: boolean): DatabaseItem[] => {
  const items = getItemsByType(isOutpatient);
  return items.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );
};

// Bill management
export const saveBill = (type: 'outpatient' | 'inpatient', items: BillItem[]): void => {
  const bills = JSON.parse(localStorage.getItem(BILLS_KEY) || '{}');
  bills[type] = items;
  localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
};

export const loadBill = (type: 'outpatient' | 'inpatient'): BillItem[] => {
  const bills = JSON.parse(localStorage.getItem(BILLS_KEY) || '{}');
  return bills[type] || [];
};

export const getCategories = (isOutpatient: boolean): string[] => {
  if (isOutpatient) {
    return [
      'Registration',
      'Dr. Fee',
      'Medic Fee',
      'Off-Charge',
      'Laboratory',
      'X-Ray',
      'Medicine',
      'Procedure',
      'O.R',
      'Physical therapy',
      'Others'
    ];
  } else {
    return [
      'Blood',
      'Laboratory',
      'Limb and Brace',
      'Food',
      'Halo, O2, NO2, etc.',
      'Orthopedic, S.Roll, etc.',
      'Surgery, O.R. & Delivery',
      'Registration Fees',
      'Discharge Medicine',
      'Medicine, ORS, & Anesthesia, Ket, Spinal',
      'Physical Therapy',
      "IV.'s",
      'Plaster/Milk',
      'Procedures',
      'Seat & Ad. Fee',
      'X-Ray',
      'Lost Laundry',
      'Travel',
      'Others'
    ];
  }
};