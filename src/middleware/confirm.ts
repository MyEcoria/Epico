/*
** EPITECH PROJECT, 2025
** confirm.ts
** File description:
** Middleware to confirm user ID format
*/
import { isUUID } from "../../modules/utils";

export default async (req: any, res: any, next: any) => {
    if (!req.params.id) {
        res.status(400).json({ status: "error", message: "Missing id" });
        return;
    }
    if (!isUUID(req.params.id)) {
        res.status(400).json({ status: "error", message: "Invalid id #01" });
        return;
    }
    next();
};