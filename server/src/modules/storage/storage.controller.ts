import { Request, Response } from "express";
import { storageFactory } from "./storage.factory.js";
import { StorageService } from "./storage.service.js";
import { storageRepository } from "./storage.repository.js";
import { connectStorageSchema, uploadUrlSchema } from "./storage.validation.js";
import { ZodError } from "zod";

export const isActive = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    const activeIntegration = await storageRepository.getAllIntegrations(
      user.organizationId,
    );

    res.json({
      message: "active storage found",
      data: activeIntegration,
    });
  } catch (error) {
    console.error("Error finding active storage:", error);
    res.status(500).json({ error: "Failed to find active storage" });
  }
};

export const connectStorage = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    console.log("recieved body is: ", req.body);

    // Validate input
    const validatedData = connectStorageSchema.parse(req.body);

    // Deactivate all existing integrations for this organization
    await storageRepository.deactivateAll(user.organizationId);

    // Create new integration with validated data
    let integration;

    try {
      integration = await storageRepository.createIntegration({
        organizationId: user.organizationId,
        provider: validatedData.provider,
        config: validatedData.config,
        isActive: true,
        region: validatedData.config.region || null,
      });
    } catch (error) {
      console.error("Error creating integration:", error);

      return res.status(500).json({
        error: "Failed to create storage integration",
      });
    }

    console.log("Integration saved:", integration);

    res.json({
      message: "Storage connected successfully",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    console.error("Error connecting storage:", error);
    res.status(500).json({ error: "Failed to connect storage" });
  }
};

export const generateUploadUrl = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    // Validate input
    const validatedData = uploadUrlSchema.parse(req.body);

    const integration = await storageRepository.getActiveIntegration(
      user.organizationId,
    );

    console.log("Active integration found:", integration);

    if (!integration) {
      return res
        .status(404)
        .json({ error: "No active storage integration found" });
    }

    const adapter = storageFactory(integration as any);
    const storage = new StorageService(adapter);

    console.log("Generated upload URL:");

    const result = await storage.generateUploadUrl(
      validatedData.fileName,
      validatedData.fileType,
    );

    console.log("redult when getting upload url", result);

    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
};

export const generateDownloadUrl = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { key } = req.params;

    // Validate input
    if (!key || key?.trim() === "") {
      return res.status(400).json({ error: "File key is required" });
    }

    const integration = await storageRepository.getActiveIntegration(
      user.organizationId,
    );

    if (!integration) {
      return res
        .status(404)
        .json({ error: "No active storage integration found" });
    }

    const adapter = storageFactory(integration as any);
    const storage = new StorageService(adapter);

    const url = await storage.generateDownloadUrl(key);
    res.json({ url });
  } catch (error) {
    console.error("Error generating download URL:", error);
    res.status(500).json({ error: "Failed to generate download URL" });
  }
};
