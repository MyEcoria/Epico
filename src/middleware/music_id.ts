/*
** EPITECH PROJECT, 2025
** music_id.ts
** File description:
** Middleware to confirm music ID format
*/
import { Request, Response, NextFunction } from 'express';

export default async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id) {
        res.status(400).json({ status: "error", message: "Missing id" });
        return;
    }
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
        res.status(400).json({ status: "error", message: "Invalid id #02" });
        return;
    }
    next();
};