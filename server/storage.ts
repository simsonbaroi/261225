import { 
  type User, 
  type InsertUser,
  type MedicalItem,
  type InsertMedicalItem,
  type Bill,
  type InsertBill,
  medicalItemPrices,
  users,
  bills
} from "@shared/schema";
import { db, initializeDatabase } from "./db";
import { eq, and, like } from "drizzle-orm";
import { getOrderedCategories, getDefaultItems } from "@shared/categories";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Medical items methods
  getAllMedicalItems(): Promise<MedicalItem[]>;
  getMedicalItemsByType(isOutpatient: boolean): Promise<MedicalItem[]>;
  getMedicalItemsByCategory(category: string, isOutpatient: boolean): Promise<MedicalItem[]>;
  createMedicalItem(item: InsertMedicalItem): Promise<MedicalItem>;
  updateMedicalItem(id: number, item: Partial<InsertMedicalItem>): Promise<MedicalItem | undefined>;
  deleteMedicalItem(id: number): Promise<boolean>;
  searchMedicalItems(query: string, isOutpatient: boolean): Promise<MedicalItem[]>;
  
  // Bills methods
  saveBill(bill: InsertBill): Promise<Bill>;
  getBillBySession(sessionId: string, type: "outpatient" | "inpatient"): Promise<Bill | undefined>;
  initializeDatabase(): Promise<void>;
}

export class SQLiteStorage implements IStorage {
  private initialized = false;

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllMedicalItems(): Promise<MedicalItem[]> {
    const result = await db.select().from(medicalItemPrices);
    return result.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
  }

  async getMedicalItemsByType(isOutpatient: boolean): Promise<MedicalItem[]> {
    const result = await db.select().from(medicalItemPrices).where(eq(medicalItemPrices.isOutpatient, isOutpatient));
    return result.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
  }

  async getMedicalItemsByCategory(category: string, isOutpatient: boolean): Promise<MedicalItem[]> {
    const result = await db.select().from(medicalItemPrices)
      .where(and(
        eq(medicalItemPrices.category, category),
        eq(medicalItemPrices.isOutpatient, isOutpatient)
      ));
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  async createMedicalItem(item: InsertMedicalItem): Promise<MedicalItem> {
    const result = await db.insert(medicalItemPrices).values({
      ...item,
      createdAt: new Date(),
    }).returning();
    return result[0];
  }

  async updateMedicalItem(id: number, item: Partial<InsertMedicalItem>): Promise<MedicalItem | undefined> {
    const result = await db.update(medicalItemPrices)
      .set(item)
      .where(eq(medicalItemPrices.id, id))
      .returning();
    return result[0];
  }

  async deleteMedicalItem(id: number): Promise<boolean> {
    const result = await db.delete(medicalItemPrices)
      .where(eq(medicalItemPrices.id, id))
      .returning();
    return result.length > 0;
  }

  async searchMedicalItems(query: string, isOutpatient: boolean): Promise<MedicalItem[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    const result = await db.select().from(medicalItemPrices)
      .where(and(
        eq(medicalItemPrices.isOutpatient, isOutpatient),
        like(medicalItemPrices.name, lowerQuery)
      ));
    return result.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
  }

  async saveBill(bill: InsertBill): Promise<Bill> {
    // First, try to find existing bill
    const existingBill = await db.select().from(bills)
      .where(and(
        eq(bills.sessionId, bill.sessionId),
        eq(bills.type, bill.type)
      ))
      .limit(1);
    
    if (existingBill.length > 0) {
      // Update existing bill
      const result = await db.update(bills)
        .set({
          billData: bill.billData,
          total: bill.total,
          daysAdmitted: bill.daysAdmitted || 1,
          updatedAt: new Date(),
        })
        .where(eq(bills.id, existingBill[0].id))
        .returning();
      return result[0];
    } else {
      // Create new bill
      const result = await db.insert(bills).values({
        ...bill,
        daysAdmitted: bill.daysAdmitted || 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return result[0];
    }
  }

  async getBillBySession(sessionId: string, type: "outpatient" | "inpatient"): Promise<Bill | undefined> {
    const result = await db.select().from(bills)
      .where(and(
        eq(bills.sessionId, sessionId),
        eq(bills.type, type)
      ))
      .orderBy(bills.updatedAt)
      .limit(1);
    return result[0];
  }

  async initializeDatabase(): Promise<void> {
    if (this.initialized) return;
    
    // Initialize SQLite database
    await initializeDatabase();
    
    // Clear existing data to ensure clean state
    await db.delete(medicalItemPrices);
    
    // Initialize with default price data only - categories come from shared/categories.ts
    const defaultItems = [
      // Outpatient items
      { category: 'Laboratory', name: 'Complete Blood Count', price: 250.00, currency: 'BDT', isOutpatient: true },
      { category: 'Laboratory', name: 'Urinalysis', price: 150.00, currency: 'BDT', isOutpatient: true },
      { category: 'Laboratory', name: 'Blood Chemistry', price: 400.00, currency: 'BDT', isOutpatient: true },
      { category: 'Laboratory', name: 'Liver Function Test', price: 600.00, currency: 'BDT', isOutpatient: true },
      { category: 'Laboratory', name: 'Kidney Function Test', price: 550.00, currency: 'BDT', isOutpatient: true },
      { category: 'Laboratory', name: 'Lipid Profile', price: 450.00, currency: 'BDT', isOutpatient: true },
      { category: 'Laboratory', name: 'Thyroid Function Test', price: 800.00, currency: 'BDT', isOutpatient: true },
      { category: 'Laboratory', name: 'Blood Sugar', price: 100.00, currency: 'BDT', isOutpatient: true },
      { category: 'Laboratory', name: 'HbA1c', price: 650.00, currency: 'BDT', isOutpatient: true },
      { category: 'Laboratory', name: 'ESR', price: 120.00, currency: 'BDT', isOutpatient: true },
      
      { category: 'X-Ray', name: 'Chest X-Ray', price: 800.00, currency: 'BDT', isOutpatient: true },
      { category: 'X-Ray', name: 'Extremity X-Ray', price: 600.00, currency: 'BDT', isOutpatient: true },
      { category: 'X-Ray', name: 'Spine X-Ray', price: 900.00, currency: 'BDT', isOutpatient: true },
      { category: 'X-Ray', name: 'Abdomen X-Ray', price: 700.00, currency: 'BDT', isOutpatient: true },
      { category: 'X-Ray', name: 'Pelvis X-Ray', price: 750.00, currency: 'BDT', isOutpatient: true },
      
      { category: 'Registration Fees', name: 'Outpatient Registration', price: 100.00, currency: 'BDT', isOutpatient: true },
      { category: 'Registration Fees', name: 'Emergency Registration', price: 200.00, currency: 'BDT', isOutpatient: true },
      { category: 'Registration Fees', name: 'Admission Fee', price: 500.00, currency: 'BDT', isOutpatient: true },
      { category: 'Registration Fees', name: 'ICU Admission', price: 1000.00, currency: 'BDT', isOutpatient: true },
      
      { category: 'Dr. Fees', name: 'General Consultation', price: 500.00, currency: 'BDT', isOutpatient: true },
      { category: 'Dr. Fees', name: 'Specialist Consultation', price: 800.00, currency: 'BDT', isOutpatient: true },
      { category: 'Dr. Fees', name: 'Emergency Consultation', price: 1000.00, currency: 'BDT', isOutpatient: true },
      
      { category: 'Medic Fee', name: 'Basic Medical Service', price: 300.00, currency: 'BDT', isOutpatient: true },
      { category: 'Medic Fee', name: 'Advanced Medical Service', price: 500.00, currency: 'BDT', isOutpatient: true },
      { category: 'Medic Fee', name: 'Emergency Medical Service', price: 700.00, currency: 'BDT', isOutpatient: true },
      
      // Medicine - Outpatient
      { category: 'Medicine', name: 'Paracetamol 500mg', price: 15.00, currency: 'BDT', isOutpatient: true },
      { category: 'Medicine', name: 'Aspirin 75mg', price: 12.00, currency: 'BDT', isOutpatient: true },
      { category: 'Medicine', name: 'Amoxicillin 500mg', price: 25.00, currency: 'BDT', isOutpatient: true },
      { category: 'Medicine', name: 'Ibuprofen 400mg', price: 18.00, currency: 'BDT', isOutpatient: true },
      { category: 'Medicine', name: 'Omeprazole 20mg', price: 22.00, currency: 'BDT', isOutpatient: true },
      { category: 'Medicine', name: 'Cetirizine 10mg', price: 14.00, currency: 'BDT', isOutpatient: true },
      { category: 'Medicine', name: 'Metformin 500mg', price: 16.00, currency: 'BDT', isOutpatient: true },
      { category: 'Medicine', name: 'Amlodipine 5mg', price: 20.00, currency: 'BDT', isOutpatient: true },
      { category: 'Medicine', name: 'Atorvastatin 20mg', price: 35.00, currency: 'BDT', isOutpatient: true },
      { category: 'Medicine', name: 'Azithromycin 500mg', price: 45.00, currency: 'BDT', isOutpatient: true },
      
      // Inpatient items
      { category: 'Laboratory', name: 'Complete Blood Count', price: 300.00, currency: 'BDT', isOutpatient: false },
      { category: 'Laboratory', name: 'Blood Chemistry Panel', price: 500.00, currency: 'BDT', isOutpatient: false },
      { category: 'Laboratory', name: 'Liver Function Test', price: 600.00, currency: 'BDT', isOutpatient: false },
      { category: 'Laboratory', name: 'Kidney Function Test', price: 550.00, currency: 'BDT', isOutpatient: false },
      { category: 'Laboratory', name: 'Cardiac Enzymes', price: 800.00, currency: 'BDT', isOutpatient: false },
      { category: 'Laboratory', name: 'Coagulation Studies', price: 700.00, currency: 'BDT', isOutpatient: false },
      { category: 'Laboratory', name: 'Blood Gas Analysis', price: 650.00, currency: 'BDT', isOutpatient: false },
      { category: 'Laboratory', name: 'Electrolyte Panel', price: 400.00, currency: 'BDT', isOutpatient: false },
      
      { category: 'Halo, O2, NO2, etc.', name: 'Oxygen Therapy (per day)', price: 400.00, currency: 'BDT', isOutpatient: false },
      { category: 'Halo, O2, NO2, etc.', name: 'Nitrous Oxide', price: 600.00, currency: 'BDT', isOutpatient: false },
      { category: 'Halo, O2, NO2, etc.', name: 'Halo Traction', price: 1200.00, currency: 'BDT', isOutpatient: false },
      { category: 'Halo, O2, NO2, etc.', name: 'CPAP Machine (per day)', price: 800.00, currency: 'BDT', isOutpatient: false },
      
      { category: 'Orthopedic, S.Roll, etc.', name: 'Orthopedic Consultation', price: 800.00, currency: 'BDT', isOutpatient: false },
      { category: 'Orthopedic, S.Roll, etc.', name: 'Spinal Roll Support', price: 1500.00, currency: 'BDT', isOutpatient: false },
      { category: 'Orthopedic, S.Roll, etc.', name: 'Orthopedic Brace', price: 2200.00, currency: 'BDT', isOutpatient: false },
      { category: 'Orthopedic, S.Roll, etc.', name: 'Spine Support System', price: 3500.00, currency: 'BDT', isOutpatient: false },
      { category: 'Orthopedic, S.Roll, etc.', name: 'Orthopedic Device Setup', price: 1800.00, currency: 'BDT', isOutpatient: false },
      
      { category: 'Surgery, O.R. & Delivery', name: 'Minor Surgery', price: 15000.00, currency: 'BDT', isOutpatient: false },
      { category: 'Surgery, O.R. & Delivery', name: 'Major Surgery', price: 35000.00, currency: 'BDT', isOutpatient: false },
      { category: 'Surgery, O.R. & Delivery', name: 'Normal Delivery', price: 8000.00, currency: 'BDT', isOutpatient: false },
      { category: 'Surgery, O.R. & Delivery', name: 'C-Section Delivery', price: 25000.00, currency: 'BDT', isOutpatient: false },
      { category: 'Surgery, O.R. & Delivery', name: 'Operating Room Fee', price: 5000.00, currency: 'BDT', isOutpatient: false },
      { category: 'Surgery, O.R. & Delivery', name: 'Anesthesia Fee', price: 3000.00, currency: 'BDT', isOutpatient: false },
      
      { category: 'Registration Fees', name: 'Outpatient Registration', price: 100.00, currency: 'BDT', isOutpatient: false },
      { category: 'Registration Fees', name: 'Emergency Registration', price: 200.00, currency: 'BDT', isOutpatient: false },
      { category: 'Registration Fees', name: 'Admission Fee', price: 500.00, currency: 'BDT', isOutpatient: false },
      { category: 'Registration Fees', name: 'ICU Admission', price: 1000.00, currency: 'BDT', isOutpatient: false },
      { category: 'Registration Fees', name: 'Private Room Fee', price: 800.00, currency: 'BDT', isOutpatient: false },
      { category: 'Registration Fees', name: 'Semi-Private Room Fee', price: 600.00, currency: 'BDT', isOutpatient: false },
      
      { category: 'Discharge Medicine', name: 'Discharge Medication Package', price: 800.00, currency: 'BDT', isOutpatient: false },
      { category: 'Discharge Medicine', name: 'Pain Relief Package', price: 400.00, currency: 'BDT', isOutpatient: false },
      { category: 'Discharge Medicine', name: 'Antibiotic Course', price: 600.00, currency: 'BDT', isOutpatient: false },
      { category: 'Discharge Medicine', name: 'Chronic Disease Package', price: 1200.00, currency: 'BDT', isOutpatient: false },
    ];

    // Insert default price data
    for (const item of defaultItems) {
      await db.insert(medicalItemPrices).values({
        ...item,
        createdAt: new Date(),
      });
    }

    this.initialized = true;
    console.log('SQLite database initialized with default price data');
  }
}

// Export singleton instance
export const storage = new SQLiteStorage();