import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

// interface AuthRequest extends Request {
//   user?: string | JwtPayload;
// }

declare global {
  namespace Express {
    interface Request {
      user?:
        | {
            id: string;
          }
        | JwtPayload;
    }
  }
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  const secret: string = process.env.SECRET_KEY as string;

  if (!secret) {
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "string") {
      return res.status(401).json({ message: "Invalid User" });
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid User" });
  }
}

export default authMiddleware;
