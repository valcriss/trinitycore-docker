import { describe, it, expect, vi, afterEach } from "vitest";

const ORIGINAL_ENV = { ...process.env };

const loadRouter = async (env: Record<string, string | undefined>) => {
  process.env = { ...ORIGINAL_ENV, ...env };
  vi.resetModules();
  return (await import("../../src/routes/Authentication")).default;
};

describe("Authentication routes", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  it("authenticates valid credentials", async () => {
    const router = await loadRouter({ ACCESS_USERNAME: "user", ACCESS_PASSWORD: "pass" });
    const postLayer = router.stack.find((layer: any) => layer.route?.path === "/authenticate");
    const handler = postLayer.route.stack[0].handle;

    const req = { body: { username: "user", password: "pass" } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("rejects invalid credentials", async () => {
    const router = await loadRouter({ ACCESS_USERNAME: "user", ACCESS_PASSWORD: "pass" });
    const postLayer = router.stack.find((layer: any) => layer.route?.path === "/authenticate");
    const handler = postLayer.route.stack[0].handle;

    const req = { body: { username: "user", password: "wrong" } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid credentials" });
  });

  it("returns authentication requirement state", async () => {
    const router = await loadRouter({ ACCESS_USERNAME: "user", ACCESS_PASSWORD: "pass" });
    const getLayer = router.stack.find((layer: any) => layer.route?.path === "/needAuthentication");
    const handler = getLayer.route.stack[0].handle;

    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ needAuthentication: true });
  });
});
