/*
** EPITECH PROJECT, 2025
** music_id.ts
** File description:
** Middleware to confirm music ID format
*/
export default async (req: any, res: any, next: any) => {
    if (!req.params.id) {
        res.status(400).json({ status: "error", message: "Missing id" });
        return;
    }
    if (!(req.params.id > 0)) {
        res.status(400).json({ status: "error", message: "Invalid id #02" });
        return;
    }
    next();
};