import { describe, it, expect, vi } from "vitest";
import router from "../../src/routes/Index";

describe("Index route", () => {
  it("serves the index file", () => {
    const layer = router.stack.find((item: any) => item.route?.path === "/");
    const handler = layer.route.stack[0].handle;

    const req = {};
    const res = { sendFile: vi.fn() };

    handler(req, res);

    expect(res.sendFile).toHaveBeenCalledWith(expect.stringContaining("public/index.html"));
  });
});
