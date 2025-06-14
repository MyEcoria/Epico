/*
** EPITECH PROJECT, 2025
** search.ts
** File description:
** Middleware to validate search request
*/
export default async (req: any, res: any, next: any) => {
    if (!req.body.name) {
        res.status(400).json({ status: "error", message: "Missing name" });
        return;
    }
    if (req.body.name.length > 255) {
        res.status(400).json({ status: "error", message: "Invalid name, too long" });
        return
    }
    next();
};
