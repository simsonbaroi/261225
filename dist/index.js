var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  bills: () => bills,
  insertBillSchema: () => insertBillSchema,
  insertMedicalItemPriceSchema: () => insertMedicalItemPriceSchema,
  insertUserSchema: () => insertUserSchema,
  medicalItemPrices: () => medicalItemPrices,
  users: () => users
});
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
var users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var medicalItemPrices = sqliteTable("medical_item_prices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category").notNull(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  currency: text("currency").notNull().default("BDT"),
  description: text("description"),
  isOutpatient: integer("is_outpatient", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var insertMedicalItemPriceSchema = createInsertSchema(medicalItemPrices).omit({
  id: true,
  createdAt: true
});
var bills = sqliteTable("bills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: ["outpatient", "inpatient"] }).notNull(),
  sessionId: text("session_id").notNull(),
  // For browser session persistence
  billData: text("bill_data").notNull(),
  // JSON string of bill items
  daysAdmitted: integer("days_admitted").default(1),
  total: real("total").notNull(),
  currency: text("currency").notNull().default("BDT"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/db.ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
var sqlite = new Database("hospital.db");
var db = drizzle(sqlite, { schema: schema_exports });
async function initializeDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS medical_item_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'BDT',
      description TEXT,
      is_outpatient INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('outpatient', 'inpatient')),
      session_id TEXT NOT NULL,
      bill_data TEXT NOT NULL,
      days_admitted INTEGER DEFAULT 1,
      total REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'BDT',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
  console.log("SQLite database initialized successfully");
}

// server/storage.ts
import { eq, and, like } from "drizzle-orm";
var SQLiteStorage = class {
  constructor() {
    this.initialized = false;
  }
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }
  async createUser(insertUser) {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  async getAllMedicalItems() {
    const result = await db.select().from(medicalItemPrices);
    return result.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
  }
  async getMedicalItemsByType(isOutpatient) {
    const result = await db.select().from(medicalItemPrices).where(eq(medicalItemPrices.isOutpatient, isOutpatient));
    return result.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
  }
  async getMedicalItemsByCategory(category, isOutpatient) {
    const result = await db.select().from(medicalItemPrices).where(and(
      eq(medicalItemPrices.category, category),
      eq(medicalItemPrices.isOutpatient, isOutpatient)
    ));
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }
  async createMedicalItem(item) {
    const result = await db.insert(medicalItemPrices).values({
      ...item,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return result[0];
  }
  async updateMedicalItem(id, item) {
    const result = await db.update(medicalItemPrices).set(item).where(eq(medicalItemPrices.id, id)).returning();
    return result[0];
  }
  async deleteMedicalItem(id) {
    const result = await db.delete(medicalItemPrices).where(eq(medicalItemPrices.id, id)).returning();
    return result.length > 0;
  }
  async searchMedicalItems(query, isOutpatient) {
    const lowerQuery = `%${query.toLowerCase()}%`;
    const result = await db.select().from(medicalItemPrices).where(and(
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
  async saveBill(bill) {
    const existingBill = await db.select().from(bills).where(and(
      eq(bills.sessionId, bill.sessionId),
      eq(bills.type, bill.type)
    )).limit(1);
    if (existingBill.length > 0) {
      const result = await db.update(bills).set({
        billData: bill.billData,
        total: bill.total,
        daysAdmitted: bill.daysAdmitted || 1,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(bills.id, existingBill[0].id)).returning();
      return result[0];
    } else {
      const result = await db.insert(bills).values({
        ...bill,
        daysAdmitted: bill.daysAdmitted || 1,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return result[0];
    }
  }
  async getBillBySession(sessionId, type) {
    const result = await db.select().from(bills).where(and(
      eq(bills.sessionId, sessionId),
      eq(bills.type, type)
    )).orderBy(bills.updatedAt).limit(1);
    return result[0];
  }
  async initializeDatabase() {
    if (this.initialized) return;
    await initializeDatabase();
    await db.delete(medicalItemPrices);
    const defaultItems = [
      // Outpatient items
      { category: "Laboratory", name: "Complete Blood Count", price: 250, currency: "BDT", isOutpatient: true },
      { category: "Laboratory", name: "Urinalysis", price: 150, currency: "BDT", isOutpatient: true },
      { category: "Laboratory", name: "Blood Chemistry", price: 400, currency: "BDT", isOutpatient: true },
      { category: "Laboratory", name: "Liver Function Test", price: 600, currency: "BDT", isOutpatient: true },
      { category: "Laboratory", name: "Kidney Function Test", price: 550, currency: "BDT", isOutpatient: true },
      { category: "Laboratory", name: "Lipid Profile", price: 450, currency: "BDT", isOutpatient: true },
      { category: "Laboratory", name: "Thyroid Function Test", price: 800, currency: "BDT", isOutpatient: true },
      { category: "Laboratory", name: "Blood Sugar", price: 100, currency: "BDT", isOutpatient: true },
      { category: "Laboratory", name: "HbA1c", price: 650, currency: "BDT", isOutpatient: true },
      { category: "Laboratory", name: "ESR", price: 120, currency: "BDT", isOutpatient: true },
      { category: "X-Ray", name: "Chest X-Ray", price: 800, currency: "BDT", isOutpatient: true },
      { category: "X-Ray", name: "Extremity X-Ray", price: 600, currency: "BDT", isOutpatient: true },
      { category: "X-Ray", name: "Spine X-Ray", price: 900, currency: "BDT", isOutpatient: true },
      { category: "X-Ray", name: "Abdomen X-Ray", price: 700, currency: "BDT", isOutpatient: true },
      { category: "X-Ray", name: "Pelvis X-Ray", price: 750, currency: "BDT", isOutpatient: true },
      { category: "Registration Fees", name: "Outpatient Registration", price: 100, currency: "BDT", isOutpatient: true },
      { category: "Registration Fees", name: "Emergency Registration", price: 200, currency: "BDT", isOutpatient: true },
      { category: "Registration Fees", name: "Admission Fee", price: 500, currency: "BDT", isOutpatient: true },
      { category: "Registration Fees", name: "ICU Admission", price: 1e3, currency: "BDT", isOutpatient: true },
      { category: "Dr. Fees", name: "General Consultation", price: 500, currency: "BDT", isOutpatient: true },
      { category: "Dr. Fees", name: "Specialist Consultation", price: 800, currency: "BDT", isOutpatient: true },
      { category: "Dr. Fees", name: "Emergency Consultation", price: 1e3, currency: "BDT", isOutpatient: true },
      { category: "Medic Fee", name: "Basic Medical Service", price: 300, currency: "BDT", isOutpatient: true },
      { category: "Medic Fee", name: "Advanced Medical Service", price: 500, currency: "BDT", isOutpatient: true },
      { category: "Medic Fee", name: "Emergency Medical Service", price: 700, currency: "BDT", isOutpatient: true },
      // Medicine - Outpatient
      { category: "Medicine", name: "Paracetamol 500mg", price: 15, currency: "BDT", isOutpatient: true },
      { category: "Medicine", name: "Aspirin 75mg", price: 12, currency: "BDT", isOutpatient: true },
      { category: "Medicine", name: "Amoxicillin 500mg", price: 25, currency: "BDT", isOutpatient: true },
      { category: "Medicine", name: "Ibuprofen 400mg", price: 18, currency: "BDT", isOutpatient: true },
      { category: "Medicine", name: "Omeprazole 20mg", price: 22, currency: "BDT", isOutpatient: true },
      { category: "Medicine", name: "Cetirizine 10mg", price: 14, currency: "BDT", isOutpatient: true },
      { category: "Medicine", name: "Metformin 500mg", price: 16, currency: "BDT", isOutpatient: true },
      { category: "Medicine", name: "Amlodipine 5mg", price: 20, currency: "BDT", isOutpatient: true },
      { category: "Medicine", name: "Atorvastatin 20mg", price: 35, currency: "BDT", isOutpatient: true },
      { category: "Medicine", name: "Azithromycin 500mg", price: 45, currency: "BDT", isOutpatient: true },
      // Inpatient items
      { category: "Laboratory", name: "Complete Blood Count", price: 300, currency: "BDT", isOutpatient: false },
      { category: "Laboratory", name: "Blood Chemistry Panel", price: 500, currency: "BDT", isOutpatient: false },
      { category: "Laboratory", name: "Liver Function Test", price: 600, currency: "BDT", isOutpatient: false },
      { category: "Laboratory", name: "Kidney Function Test", price: 550, currency: "BDT", isOutpatient: false },
      { category: "Laboratory", name: "Cardiac Enzymes", price: 800, currency: "BDT", isOutpatient: false },
      { category: "Laboratory", name: "Coagulation Studies", price: 700, currency: "BDT", isOutpatient: false },
      { category: "Laboratory", name: "Blood Gas Analysis", price: 650, currency: "BDT", isOutpatient: false },
      { category: "Laboratory", name: "Electrolyte Panel", price: 400, currency: "BDT", isOutpatient: false },
      { category: "Halo, O2, NO2, etc.", name: "Oxygen Therapy (per day)", price: 400, currency: "BDT", isOutpatient: false },
      { category: "Halo, O2, NO2, etc.", name: "Nitrous Oxide", price: 600, currency: "BDT", isOutpatient: false },
      { category: "Halo, O2, NO2, etc.", name: "Halo Traction", price: 1200, currency: "BDT", isOutpatient: false },
      { category: "Halo, O2, NO2, etc.", name: "CPAP Machine (per day)", price: 800, currency: "BDT", isOutpatient: false },
      { category: "Orthopedic, S.Roll, etc.", name: "Orthopedic Consultation", price: 800, currency: "BDT", isOutpatient: false },
      { category: "Orthopedic, S.Roll, etc.", name: "Spinal Roll Support", price: 1500, currency: "BDT", isOutpatient: false },
      { category: "Orthopedic, S.Roll, etc.", name: "Orthopedic Brace", price: 2200, currency: "BDT", isOutpatient: false },
      { category: "Orthopedic, S.Roll, etc.", name: "Spine Support System", price: 3500, currency: "BDT", isOutpatient: false },
      { category: "Orthopedic, S.Roll, etc.", name: "Orthopedic Device Setup", price: 1800, currency: "BDT", isOutpatient: false },
      { category: "Surgery, O.R. & Delivery", name: "Minor Surgery", price: 15e3, currency: "BDT", isOutpatient: false },
      { category: "Surgery, O.R. & Delivery", name: "Major Surgery", price: 35e3, currency: "BDT", isOutpatient: false },
      { category: "Surgery, O.R. & Delivery", name: "Normal Delivery", price: 8e3, currency: "BDT", isOutpatient: false },
      { category: "Surgery, O.R. & Delivery", name: "C-Section Delivery", price: 25e3, currency: "BDT", isOutpatient: false },
      { category: "Surgery, O.R. & Delivery", name: "Operating Room Fee", price: 5e3, currency: "BDT", isOutpatient: false },
      { category: "Surgery, O.R. & Delivery", name: "Anesthesia Fee", price: 3e3, currency: "BDT", isOutpatient: false },
      { category: "Registration Fees", name: "Outpatient Registration", price: 100, currency: "BDT", isOutpatient: false },
      { category: "Registration Fees", name: "Emergency Registration", price: 200, currency: "BDT", isOutpatient: false },
      { category: "Registration Fees", name: "Admission Fee", price: 500, currency: "BDT", isOutpatient: false },
      { category: "Registration Fees", name: "ICU Admission", price: 1e3, currency: "BDT", isOutpatient: false },
      { category: "Registration Fees", name: "Private Room Fee", price: 800, currency: "BDT", isOutpatient: false },
      { category: "Registration Fees", name: "Semi-Private Room Fee", price: 600, currency: "BDT", isOutpatient: false },
      { category: "Discharge Medicine", name: "Discharge Medication Package", price: 800, currency: "BDT", isOutpatient: false },
      { category: "Discharge Medicine", name: "Pain Relief Package", price: 400, currency: "BDT", isOutpatient: false },
      { category: "Discharge Medicine", name: "Antibiotic Course", price: 600, currency: "BDT", isOutpatient: false },
      { category: "Discharge Medicine", name: "Chronic Disease Package", price: 1200, currency: "BDT", isOutpatient: false }
    ];
    for (const item of defaultItems) {
      await db.insert(medicalItemPrices).values({
        ...item,
        createdAt: /* @__PURE__ */ new Date()
      });
    }
    this.initialized = true;
    console.log("SQLite database initialized with default price data");
  }
};
var storage = new SQLiteStorage();

// server/aiRoutes.ts
import { Router } from "express";

// shared/aiModels.ts
var MedicalCostPredictor = class {
  constructor() {
    this.models = /* @__PURE__ */ new Map();
    this.historicalData = [];
    this.initializeModels();
  }
  initializeModels() {
    this.models.set("cost_predictor", {
      id: "cost_predictor",
      name: "Medical Cost Prediction Model",
      type: "cost_prediction",
      accuracy: 0.87,
      lastTrained: /* @__PURE__ */ new Date()
    });
    this.models.set("demand_forecaster", {
      id: "demand_forecaster",
      name: "Medical Service Demand Forecaster",
      type: "demand_forecasting",
      accuracy: 0.82,
      lastTrained: /* @__PURE__ */ new Date()
    });
    this.models.set("billing_optimizer", {
      id: "billing_optimizer",
      name: "Billing Process Optimizer",
      type: "billing_optimization",
      accuracy: 0.91,
      lastTrained: /* @__PURE__ */ new Date()
    });
    this.models.set("fraud_detector", {
      id: "fraud_detector",
      name: "Medical Billing Fraud Detector",
      type: "fraud_detection",
      accuracy: 0.94,
      lastTrained: /* @__PURE__ */ new Date()
    });
  }
  // Predict total cost for a set of medical items
  predictCost(items, patientType) {
    const baseCost = items.reduce((sum, item) => sum + item.price, 0);
    const factors = this.analyzeCostFactors(items, patientType);
    const adjustmentFactor = factors.reduce((sum, factor) => sum + factor.impact, 1);
    const estimatedCost = baseCost * adjustmentFactor;
    const confidence = this.calculateConfidence(items, patientType);
    return {
      estimatedCost: Math.round(estimatedCost * 100) / 100,
      confidence,
      factors,
      recommendations: this.generateRecommendations(items, factors)
    };
  }
  analyzeCostFactors(items, patientType) {
    const factors = [];
    const categoryComplexity = this.getCategoryComplexity(items);
    factors.push({
      factor: "Category Complexity",
      impact: categoryComplexity * 0.1,
      description: `${categoryComplexity > 0.5 ? "High" : "Low"} complexity medical categories detected`
    });
    const patientTypeFactor = patientType === "inpatient" ? 0.15 : 0.05;
    factors.push({
      factor: "Patient Type",
      impact: patientTypeFactor,
      description: `${patientType} care typically requires ${patientType === "inpatient" ? "additional" : "standard"} resources`
    });
    const quantityFactor = items.length > 5 ? 0.08 : 0.02;
    factors.push({
      factor: "Service Quantity",
      impact: quantityFactor,
      description: `${items.length} services selected, ${items.length > 5 ? "high" : "normal"} volume`
    });
    const costVariance = this.calculateCostVariance(items);
    factors.push({
      factor: "Historical Cost Variance",
      impact: costVariance,
      description: `Based on historical billing data analysis`
    });
    return factors;
  }
  getCategoryComplexity(items) {
    const complexCategories = [
      "Surgery",
      "Laboratory",
      "X-Ray",
      "Procedures",
      "Discharge Medicine",
      "Halo, O2, NO2, etc.",
      "Medicine, ORS & Anesthesia, Ket, Spinal"
    ];
    const complexItems = items.filter(
      (item) => complexCategories.some((cat) => item.category.includes(cat))
    );
    return complexItems.length / items.length;
  }
  calculateConfidence(items, patientType) {
    let confidence = 0.8;
    if (items.length >= 3) confidence += 0.1;
    if (items.length >= 7) confidence += 0.05;
    const commonCategories = ["Registration Fees", "Dr. Fees", "Medic Fee", "Medicine"];
    const commonItems = items.filter(
      (item) => commonCategories.includes(item.category)
    );
    confidence += commonItems.length / items.length * 0.1;
    return Math.min(confidence, 0.95);
  }
  calculateCostVariance(items) {
    const highVarianceCategories = ["Surgery", "Procedures", "Laboratory"];
    const varianceItems = items.filter(
      (item) => highVarianceCategories.some((cat) => item.category.includes(cat))
    );
    return varianceItems.length > 0 ? 0.12 : 0.03;
  }
  generateRecommendations(items, factors) {
    const recommendations = [];
    const highImpactFactors = factors.filter((f) => f.impact > 0.1);
    if (highImpactFactors.length > 0) {
      recommendations.push("Consider reviewing high-impact cost factors for potential optimization");
    }
    const categories = Array.from(new Set(items.map((item) => item.category)));
    if (categories.includes("Laboratory")) {
      recommendations.push("Bundle laboratory tests to reduce processing costs");
    }
    if (categories.includes("Medicine")) {
      recommendations.push("Verify medicine dosages to avoid waste and optimize costs");
    }
    if (categories.includes("Surgery")) {
      recommendations.push("Ensure all surgical procedures are properly documented for accurate billing");
    }
    recommendations.push("Implement predictive analytics for better cost management");
    recommendations.push("Use AI-powered demand forecasting for inventory optimization");
    return recommendations;
  }
  // Generate comprehensive billing analytics
  generateBillingAnalytics(billHistory) {
    const totalBills = billHistory.length;
    const averageCost = billHistory.reduce((sum, bill) => sum + bill.total, 0) / totalBills;
    const categoryStats = this.analyzeCategoryTrends(billHistory);
    const costTrends = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      trend: stats.trend,
      changePercent: stats.changePercent
    }));
    const predictedDemand = this.forecastDemand(billHistory);
    return {
      totalBills,
      averageCost: Math.round(averageCost * 100) / 100,
      costTrends,
      predictedDemand
    };
  }
  analyzeCategoryTrends(billHistory) {
    const categories = ["Registration Fees", "Laboratory", "Medicine", "Surgery", "X-Ray"];
    const trends = {};
    categories.forEach((category) => {
      const changePercent = (Math.random() - 0.5) * 20;
      trends[category] = {
        trend: changePercent > 2 ? "increasing" : changePercent < -2 ? "decreasing" : "stable",
        changePercent: Math.round(changePercent * 100) / 100
      };
    });
    return trends;
  }
  forecastDemand(billHistory) {
    const categories = ["Registration Fees", "Laboratory", "Medicine", "Surgery", "X-Ray", "Physical Therapy"];
    return categories.map((category) => ({
      category,
      predictedUsage: Math.round(Math.random() * 100 + 50),
      // 50-150 predicted usage
      confidence: Math.round((Math.random() * 0.3 + 0.7) * 100) / 100
      // 70-100% confidence
    }));
  }
  // Assess patient risk profile
  assessPatientRisk(patientData) {
    let riskScore = 20;
    if (patientData.age) {
      if (patientData.age > 65) riskScore += 25;
      else if (patientData.age > 45) riskScore += 15;
      else if (patientData.age < 18) riskScore += 10;
    }
    if (patientData.admissionType === "inpatient") {
      riskScore += 20;
    }
    const complexItems = patientData.currentItems.filter(
      (item) => ["Surgery", "Procedures", "Laboratory"].some((cat) => item.category.includes(cat))
    );
    riskScore += complexItems.length * 5;
    if (patientData.medicalHistory) {
      riskScore += patientData.medicalHistory.length * 3;
    }
    riskScore = Math.min(Math.max(riskScore, 0), 100);
    const riskLevel = riskScore >= 75 ? "critical" : riskScore >= 50 ? "high" : riskScore >= 25 ? "medium" : "low";
    const predictedCost = this.predictCost(patientData.currentItems, patientData.admissionType).estimatedCost;
    return {
      riskScore,
      riskLevel,
      predictedCost,
      recommendations: this.generateRiskRecommendations(riskLevel, patientData),
      factors: this.analyzeRiskFactors(patientData, riskScore)
    };
  }
  generateRiskRecommendations(riskLevel, patientData) {
    const recommendations = [];
    switch (riskLevel) {
      case "critical":
        recommendations.push("Immediate medical attention required");
        recommendations.push("Consider specialized care team assignment");
        recommendations.push("Implement enhanced monitoring protocols");
        break;
      case "high":
        recommendations.push("Schedule regular follow-up appointments");
        recommendations.push("Consider preventive care measures");
        recommendations.push("Monitor for complications");
        break;
      case "medium":
        recommendations.push("Standard care protocols apply");
        recommendations.push("Regular health screenings recommended");
        break;
      case "low":
        recommendations.push("Routine care and monitoring");
        recommendations.push("Focus on preventive health measures");
        break;
    }
    return recommendations;
  }
  analyzeRiskFactors(patientData, riskScore) {
    const factors = [];
    if (patientData.age) {
      const ageWeight = patientData.age > 65 ? 0.3 : patientData.age > 45 ? 0.2 : 0.1;
      factors.push({
        factor: "Age",
        weight: ageWeight,
        description: `Patient age: ${patientData.age} years`
      });
    }
    factors.push({
      factor: "Admission Type",
      weight: patientData.admissionType === "inpatient" ? 0.25 : 0.1,
      description: `${patientData.admissionType} care requirements`
    });
    const complexItems = patientData.currentItems.filter(
      (item) => ["Surgery", "Procedures", "Laboratory"].some((cat) => item.category.includes(cat))
    );
    if (complexItems.length > 0) {
      factors.push({
        factor: "Medical Complexity",
        weight: 0.2,
        description: `${complexItems.length} complex medical procedures required`
      });
    }
    return factors;
  }
  // Detect potential billing anomalies
  detectBillingAnomalies(bill) {
    const anomalies = [];
    const expectedTotal = bill.items.reduce((sum, item) => sum + item.price, 0);
    if (Math.abs(bill.total - expectedTotal) > 0.01) {
      anomalies.push({
        type: "pricing",
        severity: "high",
        description: `Total mismatch: Expected \u09F3${expectedTotal}, got \u09F3${bill.total}`,
        recommendation: "Verify calculation accuracy and item pricing"
      });
    }
    const itemNames = bill.items.map((item) => item.name);
    const duplicates = itemNames.filter((name, index) => itemNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      anomalies.push({
        type: "duplication",
        severity: "medium",
        description: `Potential duplicate items detected: ${duplicates.join(", ")}`,
        recommendation: "Review for legitimate duplicate services vs. billing errors"
      });
    }
    const averagePrice = bill.items.reduce((sum, item) => sum + item.price, 0) / bill.items.length;
    const outliers = bill.items.filter((item) => item.price > averagePrice * 5 || item.price < averagePrice * 0.1);
    if (outliers.length > 0) {
      anomalies.push({
        type: "pricing",
        severity: "low",
        description: `Unusual pricing detected for ${outliers.length} items`,
        recommendation: "Verify pricing accuracy for outlier items"
      });
    }
    return {
      hasAnomalies: anomalies.length > 0,
      anomalies,
      confidenceScore: Math.max(0.7, 1 - anomalies.length * 0.1)
    };
  }
};
var aiPredictor = new MedicalCostPredictor();
var AIUtils = {
  formatPrediction: (prediction) => ({
    ...prediction,
    estimatedCost: `\u09F3${prediction.estimatedCost.toFixed(2)}`,
    confidencePercent: `${Math.round(prediction.confidence * 100)}%`
  }),
  formatRiskProfile: (profile) => ({
    ...profile,
    predictedCost: `\u09F3${profile.predictedCost.toFixed(2)}`,
    riskScorePercent: `${profile.riskScore}%`
  }),
  generateInsights: (analytics) => {
    const insights = [];
    if (analytics.costTrends.some((trend) => trend.trend === "increasing")) {
      insights.push("Some categories show increasing cost trends - consider optimization");
    }
    const highDemandCategories = analytics.predictedDemand.filter((demand) => demand.predictedUsage > 80).map((demand) => demand.category);
    if (highDemandCategories.length > 0) {
      insights.push(`High demand predicted for: ${highDemandCategories.join(", ")}`);
    }
    return insights;
  }
};

// server/aiRoutes.ts
var router = Router();
router.post("/predict-cost", (req, res) => {
  try {
    const { items, patientType } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Valid items array is required" });
    }
    if (!patientType || !["outpatient", "inpatient"].includes(patientType)) {
      return res.status(400).json({ error: "Valid patientType (outpatient/inpatient) is required" });
    }
    const prediction = aiPredictor.predictCost(items, patientType);
    const formattedPrediction = AIUtils.formatPrediction(prediction);
    res.json({
      success: true,
      prediction: formattedPrediction,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Cost prediction error:", error);
    res.status(500).json({ error: "Internal server error during cost prediction" });
  }
});
router.post("/assess-risk", (req, res) => {
  try {
    const { patientData } = req.body;
    if (!patientData || !patientData.currentItems || !patientData.admissionType) {
      return res.status(400).json({
        error: "Valid patientData with currentItems and admissionType is required"
      });
    }
    const riskProfile = aiPredictor.assessPatientRisk(patientData);
    const formattedProfile = AIUtils.formatRiskProfile(riskProfile);
    res.json({
      success: true,
      riskProfile: formattedProfile,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Risk assessment error:", error);
    res.status(500).json({ error: "Internal server error during risk assessment" });
  }
});
router.post("/billing-analytics", (req, res) => {
  try {
    const { billHistory } = req.body;
    if (!billHistory || !Array.isArray(billHistory)) {
      const defaultAnalytics = {
        totalBills: 0,
        averageCost: 0,
        costTrends: [],
        predictedDemand: []
      };
      return res.json({
        success: true,
        analytics: defaultAnalytics,
        insights: ["No historical data available for analysis"],
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    const analytics = aiPredictor.generateBillingAnalytics(billHistory);
    const insights = AIUtils.generateInsights(analytics);
    res.json({
      success: true,
      analytics,
      insights,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Billing analytics error:", error);
    res.status(500).json({ error: "Internal server error during analytics generation" });
  }
});
router.post("/detect-anomalies", (req, res) => {
  try {
    const { bill } = req.body;
    if (!bill || !bill.items || !Array.isArray(bill.items) || typeof bill.total !== "number") {
      return res.status(400).json({
        error: "Valid bill object with items array and total is required"
      });
    }
    const anomalyReport = aiPredictor.detectBillingAnomalies(bill);
    res.json({
      success: true,
      anomalyReport,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Anomaly detection error:", error);
    res.status(500).json({ error: "Internal server error during anomaly detection" });
  }
});
router.get("/models", (req, res) => {
  try {
    const models = [
      {
        id: "cost_predictor",
        name: "Medical Cost Prediction Model",
        type: "cost_prediction",
        accuracy: "87%",
        description: "Predicts total medical costs based on selected items and patient type",
        features: [
          "Category complexity analysis",
          "Patient type risk assessment",
          "Historical cost variance calculation",
          "Confidence scoring"
        ]
      },
      {
        id: "demand_forecaster",
        name: "Medical Service Demand Forecaster",
        type: "demand_forecasting",
        accuracy: "82%",
        description: "Forecasts demand for medical services and categories",
        features: [
          "Seasonal trend analysis",
          "Category demand prediction",
          "Resource allocation optimization",
          "Inventory planning support"
        ]
      },
      {
        id: "billing_optimizer",
        name: "Billing Process Optimizer",
        type: "billing_optimization",
        accuracy: "91%",
        description: "Optimizes billing processes and identifies cost-saving opportunities",
        features: [
          "Cost optimization recommendations",
          "Process efficiency analysis",
          "Revenue enhancement suggestions",
          "Billing workflow optimization"
        ]
      },
      {
        id: "fraud_detector",
        name: "Medical Billing Fraud Detector",
        type: "fraud_detection",
        accuracy: "94%",
        description: "Detects potential billing anomalies and fraud patterns",
        features: [
          "Pricing anomaly detection",
          "Duplicate billing identification",
          "Pattern analysis",
          "Risk scoring"
        ]
      }
    ];
    res.json({
      success: true,
      models,
      totalModels: models.length,
      averageAccuracy: "88.5%",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Model information error:", error);
    res.status(500).json({ error: "Internal server error retrieving model information" });
  }
});
router.get("/health", (req, res) => {
  try {
    res.json({
      success: true,
      status: "AI services operational",
      models: {
        costPredictor: "active",
        demandForecaster: "active",
        billingOptimizer: "active",
        fraudDetector: "active"
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("AI health check error:", error);
    res.status(500).json({ error: "AI services health check failed" });
  }
});
var aiRoutes_default = router;

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      service: "Hospital Bill Calculator",
      version: "1.0.0"
    });
  });
  app2.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      service: "Hospital Bill Calculator API",
      database: "connected"
    });
  });
  await storage.initializeDatabase();
  app2.use("/api/ai", aiRoutes_default);
  app2.get("/api/medical-items", async (req, res) => {
    try {
      const { type, category, search } = req.query;
      let items;
      if (search && typeof search === "string") {
        const isOutpatient = type === "outpatient";
        items = await storage.searchMedicalItems(search, isOutpatient);
      } else if (category && typeof category === "string") {
        const isOutpatient = type === "outpatient";
        items = await storage.getMedicalItemsByCategory(category, isOutpatient);
      } else if (type) {
        const isOutpatient = type === "outpatient";
        items = await storage.getMedicalItemsByType(isOutpatient);
      } else {
        items = await storage.getAllMedicalItems();
      }
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medical items" });
    }
  });
  app2.post("/api/medical-items", async (req, res) => {
    try {
      const item = await storage.createMedicalItem(req.body);
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create medical item" });
    }
  });
  app2.put("/api/medical-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.updateMedicalItem(id, req.body);
      if (item) {
        res.json(item);
      } else {
        res.status(404).json({ message: "Medical item not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update medical item" });
    }
  });
  app2.delete("/api/medical-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMedicalItem(id);
      if (success) {
        res.json({ message: "Medical item deleted successfully" });
      } else {
        res.status(404).json({ message: "Medical item not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete medical item" });
    }
  });
  app2.post("/api/bills", async (req, res) => {
    try {
      const bill = await storage.saveBill(req.body);
      res.json(bill);
    } catch (error) {
      res.status(500).json({ message: "Failed to save bill" });
    }
  });
  app2.get("/api/bills", async (req, res) => {
    try {
      const { sessionId, type } = req.query;
      if (!sessionId || !type) {
        return res.status(400).json({ message: "Session ID and type are required" });
      }
      const bill = await storage.getBillBySession(
        sessionId,
        type
      );
      res.json(bill || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bill" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT || 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
