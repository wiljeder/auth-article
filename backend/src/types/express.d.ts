import { Request } from "express";
import { TUser } from "../db";

declare module "express" {
  export interface Request {
    user?: TUser; // Define `user` property (Modify type as needed)
  }
}
