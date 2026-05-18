import { describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { authMiddleware } from "./auth.middlewares";

function makeResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis()
  };

  return res as unknown as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
}

describe("authMiddleware", () => {
  it("rejects requests without an authorization token", () => {
    const req = { headers: {} } as Request;
    const res = makeResponse();
    const next = vi.fn() as NextFunction;

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: true,
      message: "Token não informado"
    });
    expect(next).not.toHaveBeenCalled();
  });
});
