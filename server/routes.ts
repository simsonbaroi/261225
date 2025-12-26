import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import aiRoutes from "./aiRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoints for deployment platforms
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'Hospital Bill Calculator',
      version: '1.0.0'
    });
  });

  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'Hospital Bill Calculator API',
      database: 'connected'
    });
  });

  // Initialize database with default data
  await storage.initializeDatabase();

  // AI and ML Routes
  app.use("/api/ai", aiRoutes);

  // Medical Items API Routes
  app.get("/api/medical-items", async (req, res) => {
    try {
      const { type, category, search } = req.query;
      let items;

      if (search && typeof search === 'string') {
        const isOutpatient = type === 'outpatient';
        items = await storage.searchMedicalItems(search, isOutpatient);
      } else if (category && typeof category === 'string') {
        const isOutpatient = type === 'outpatient';
        items = await storage.getMedicalItemsByCategory(category, isOutpatient);
      } else if (type) {
        const isOutpatient = type === 'outpatient';
        items = await storage.getMedicalItemsByType(isOutpatient);
      } else {
        items = await storage.getAllMedicalItems();
      }

      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medical items" });
    }
  });

  app.post("/api/medical-items", async (req, res) => {
    try {
      const item = await storage.createMedicalItem(req.body);
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create medical item" });
    }
  });

  app.put("/api/medical-items/:id", async (req, res) => {
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

  app.delete("/api/medical-items/:id", async (req, res) => {
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

  // Bills API Routes
  app.post("/api/bills", async (req, res) => {
    try {
      const bill = await storage.saveBill(req.body);
      res.json(bill);
    } catch (error) {
      res.status(500).json({ message: "Failed to save bill" });
    }
  });

  app.get("/api/bills", async (req, res) => {
    try {
      const { sessionId, type } = req.query;
      if (!sessionId || !type) {
        return res.status(400).json({ message: "Session ID and type are required" });
      }
      
      const bill = await storage.getBillBySession(
        sessionId as string, 
        type as "outpatient" | "inpatient"
      );
      
      res.json(bill || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bill" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
