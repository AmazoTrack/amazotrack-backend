import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
 
export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
 
      const userExists = await prisma.user.findUnique({
        where: { email }
      });
 
      if (userExists) {
        return res.status(400).json({
          error: true,
          message: "E-mail já cadastrado",
          details: []
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
 
      return res.status(201).json({
        error: false,
        message: "Usuário criado com sucesso",
        user
      });
 
    } catch (error) {
        console.error(error);
        
      return res.status(500).json({
        error: true,
        message: "Erro interno",
        details: []
      });
    }
  }
 
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
 
      const user = await prisma.user.findUnique({
        where: { email }
      });
 
      if (!user) {
        return res.status(401).json({
          error: true,
          message: "Credenciais inválidas",
          details: []
        });
      }
 
      const passwordMatch = await bcrypt.compare(
        password,
        user.passwordHash
      );
 
      if (!passwordMatch) {
        return res.status(401).json({
          error: true,
          message: "Credenciais inválidas",
          details: []
        });
      }
 
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "8h" }
      );
 
      return res.json({
        token
      });
 
    } catch {
      return res.status(500).json({
        error: true,
        message: "Erro interno",
        details: []
      });
    }
  }
}