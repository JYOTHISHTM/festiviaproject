import morgan from "morgan";
import fs from "fs";
import path from "path";
import { Request, Response } from "express";

const errorLogStream = fs.createWriteStream(
  path.join(__dirname, "../../logs/error.log"),
  { flags: "a" }
);

morgan.token("error-message", (_req: Request, res: Response) => res.locals.errorMessage || "-");

export const errorLogger = morgan(
  ":method :url :status :response-time ms - :error-message",
  {
    stream: errorLogStream,
    skip: (_req, res) => res.statusCode < 400,
  }
);
