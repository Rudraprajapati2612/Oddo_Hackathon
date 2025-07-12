import { User } from "@prisma/client"; // optional if you want to extend with full user model

declare namespace Express {
  export interface Request {
    user?: {
      userId: number;
      isAdmin: boolean;
    };
  }
}
