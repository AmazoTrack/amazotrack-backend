import { Request, Response } from "express";
import { ZodError } from "zod";
import bcrypt from "bcryptjs"; // FIX: era "bcrypt" (pacote errado)
import jwt from "jsonwebtoken";

import { prisma } from "../lib/prisma";

import {
  registerSchema,
  loginSchema
} from "../schemas/auth.schemas";

export class AuthController {

  static async register(req: Request, res: Response) {

    try {

      const body = registerSchema.parse(req.body);

      const userExists = await prisma.user.findUnique({
        where: {
          email: body.email
        }
      });

      if (userExists) {
        return res.status(409).json({
          error: true,
          message: "E-mail já cadastrado",
          details: []
        });
      }

      const passwordHash = await bcrypt.hash(body.password, 10);

      const user = await prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          passwordHash
        }
      });

      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email
      });

    } catch (error: any) {

      if (error instanceof ZodError) {

        return res.status(400).json({
          error: true,
          message: "Dados inválidos",
          details: error.issues.map((err) => ({
            field: err.path[0],
            message: err.message
          }))
        });
      }

      return res.status(500).json({
        error: true,
        message: "Erro ao cadastrar usuário",
        details: []
      });
    }
  }

  static async login(req: Request, res: Response) {

    try {

      const body = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: {
          email: body.email
        }
      });

      if (!user) {
        return res.status(401).json({
          error: true,
          message: "E-mail ou senha inválidos",
          details: []
        });
      }

      const passwordMatch = await bcrypt.compare(
        body.password,
        user.passwordHash
      );

      if (!passwordMatch) {
        return res.status(401).json({
          error: true,
          message: "E-mail ou senha inválidos",
          details: []
        });
      }

      const token = jwt.sign(
        {
          userId: user.id
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "8h" // FIX: era "1d", contrato diz 8h
        }
      );

      return res.json({
        token
      });

    } catch (error: any) {

      if (error instanceof ZodError) {

        return res.status(400).json({
          error: true,
          message: "Dados inválidos",
          details: error.issues.map((err) => ({
            field: err.path[0],
            message: err.message
          }))
        });
      }

      return res.status(500).json({
        error: true,
        message: "Erro ao realizar login",
        details: []
      });
    }
  }
}
