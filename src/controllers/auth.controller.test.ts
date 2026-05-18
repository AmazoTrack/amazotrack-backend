import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import { AuthController } from "./auth.controller";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

vi.mock("../lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn()
    }
  }
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn()
  }
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn()
  }
}));

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

describe("AuthController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  it("returns a token for valid login credentials", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 4,
      name: "Arthur Mendes",
      email: "arthur@amazotrack.com",
      passwordHash: "hash",
      createdAt: new Date()
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(jwt.sign).mockReturnValue("jwt-demo" as never);

    const req = {
      body: { email: "arthur@amazotrack.com", password: "amazo2026" }
    } as Request;
    const res = makeResponse();

    await AuthController.login(req, res);

    expect(res.json).toHaveBeenCalledWith({ token: "jwt-demo" });
    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: 4 },
      "test-secret",
      { expiresIn: "8h" }
    );
  });

  it("rejects invalid login credentials", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const req = {
      body: { email: "missing@amazotrack.com", password: "wrongpass" }
    } as Request;
    const res = makeResponse();

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: true,
      message: "E-mail ou senha inválidos",
      details: []
    });
  });

  it("creates users without returning password hashes", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue("hash" as never);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 10,
      name: "Demo User",
      email: "demo@amazotrack.com",
      passwordHash: "hash",
      createdAt: new Date()
    });

    const req = {
      body: { name: "Demo User", email: "demo@amazotrack.com", password: "amazo2026" }
    } as Request;
    const res = makeResponse();

    await AuthController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: 10,
      name: "Demo User",
      email: "demo@amazotrack.com"
    });
  });
});
