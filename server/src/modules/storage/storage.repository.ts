import { eq, and } from "drizzle-orm";
import { storageIntegrations } from "../../db/schema/storageIntegrations.schema.js";
import DB from "../../config/db.js";

export const storageRepository = {
  async getActiveIntegration(organizationId: number) {
    const result = await DB.select()
      .from(storageIntegrations)
      .where(
        and(
          eq(storageIntegrations.organizationId, organizationId),
          eq(storageIntegrations.isActive, true),
        ),
      );

    if (!result) {
      throw new Error("No active storage integration found");
    }

    console.log("result storage integration: ", result);

    return result[0];
  },

  async getAllIntegrations(organizationId: number) {
    const result = await DB.select()
      .from(storageIntegrations)
      .where(eq(storageIntegrations.organizationId, organizationId));

    if (!result || result.length === 0) {
      throw new Error("No storage integrations found");
    }

    console.log("result storage integrations:", result);

    return result;
  },

  async createIntegration(data: typeof storageIntegrations.$inferInsert) {
    const result = await DB.insert(storageIntegrations)
      .values(data)
      .returning();

    console.log("result storage integration: ", result);

    return result[0];
  },

  async deactivateAll(organizationId: number) {
    return await DB.update(storageIntegrations)
      .set({ isActive: false })
      .where(eq(storageIntegrations.organizationId, organizationId));
  },
};
