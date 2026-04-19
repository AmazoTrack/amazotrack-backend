import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { loginSchema, registerSchema } from "../schemas/auth.schemas";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = registerSchema.parse(req.body);

      const userExists = await prisma.user.findUnique({
        where: { email }
      });

         if (userExists) {
      return res.status(400).json({
        error: true,
        message: "E-mail já cadastrado",
        details: [
          {
            field: "email",
            message: "E-mail já cadastrado"
          }
        ]
      });
    }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash
        }
      });

      const { passwordHash: _, ...safeUser } = user;

      return res.status(201).json({
        error: false,
        message: "Usuário criado com sucesso",
        user: safeUser
      });

    } catch (error: any) {
      console.error(error);

      if (error.errors) {
        return res.status(400).json({
          error: true,
          message: "Dados inválidos",
          details: error.errors.map((err: any) => ({
            field: err.path[0],
            message: err.message
          }))
        });
      }

      return res.status(500).json({
        error: true,
        message: "Erro interno",
        details: []
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (!user) {
        return res.status(401).json({
          error: true,
          message: "Credenciais inválidas",
          details: [
            {
              field: "email",
              message: "E-mail ou senha incorretos"
            }
          ]
        });
      }

      const passwordMatch = await bcrypt.compare(
        data.password,
        user.passwordHash
      );

      if (!passwordMatch) {
        return res.status(401).json({
          error: true,
          message: "Credenciais inválidas",
          details: [
            {
              field: "password",
              message: "E-mail ou senha incorretos"
            }
          ]
        });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "8h" }
      );

      return res.status(200).json ({
        token
      });

    } catch (error:any) {
      console.error(error);

      if (error.errors) {
        return res.status(401).json({
          error: true,
          message: "Dados inválidos",
          details: error.errors.map((err: any) => ({
            field: err.path[0],
            message: err.message
          }))
        });
      }

      return res.status(500).json({
        error: true,
        message: "Erro interno",
        details: []
      });
    }
  }
}