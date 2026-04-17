import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
    id: number;
}

declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: true,
                message: "Token não informado"
            });
        }

        const [,token] = authHeader.split(" ");

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRETS as string
        ) as TokenPayload;

        req.userId = decoded.id;

        next();
    } catch (error) {
        return res.status(401).json({
            error: true,
            message: "Token inválido"
        });
    }
}