import request from "supertest";
import app from "../src/app.js";

describe("App health checks", () => {
  it("should respond 200 on GET /health", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: "Server is running",
    });
  });

  it("should respond 200 on GET /api/v1/health", async () => {
    const response = await request(app).get("/api/v1/health");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: "API is running",
    });
  });
});
