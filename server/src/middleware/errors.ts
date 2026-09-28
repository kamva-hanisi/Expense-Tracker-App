import type { ErrorRequestHandler, RequestHandler } from "express";

type DatabaseError = Error & { code?: string };

export const notFound: RequestHandler = (request, response) => {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.path}` });
};

export const errorHandler: ErrorRequestHandler = (error: DatabaseError, _request, response, _next) => {
  if (error.code === "23505") {
    response.status(409).json({ message: "That record already exists" });
    return;
  }
  if (error.code === "22P02" || error.code === "22007") {
    response.status(400).json({ message: "Invalid request value" });
    return;
  }
  console.error(error);
  response.status(500).json({ message: "Internal server error" });
};
