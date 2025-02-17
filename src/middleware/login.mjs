import { isEpitechEmailRegex, isValidPassword } from "../../modules/utils.mjs";

export default async (req, res, next) => {
    if (!req.body.email) {
        res.status(400).json({ status: "error", message: "Missing email" });
        return;
    }
    if (!req.body.password) {
        res.status(400).json({ status: "error", message: "Missing password" });
        return;
    }
    if (!isEpitechEmailRegex(req.body.email)) {
        res.status(400).json({ status: "error", message: "Invalid email" });
        return;
    }
    if (!isValidPassword(req.body.password)) {
        res.status(400).json({ status: "error", message: "Invalid password" });
        return;
    }
    next();
};