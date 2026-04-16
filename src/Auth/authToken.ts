import Jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
}

export function createToken(payload: TokenPayload) {
  const secret = process.env.SECRET_KEY;

  if (!secret) {
    throw new Error("Server configuration error");
  }
  return Jwt.sign(payload, secret, {
    expiresIn: "7d",
  });
}
