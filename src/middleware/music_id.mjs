import { isPositiveInteger, isUUID } from "../../modules/utils.mjs";

export default async (req, res, next) => {
    if (!req.params.id) {
        res.status(400).json({ status: "error", message: "Missing id" });
        return;
    }
    if (!isPositiveInteger(req.params.id)) {
        res.status(400).json({ status: "error", message: "Invalid id" });
        return;
    }
    if (!req.headers.cookie) {
        res.status(401).json({ status: "error", message: "Unauthorized" });
        return;
    }
    if (!isUUID(req.headers.cookie)) {
        res.status(401).json({ status: "error", message: "Unauthorized" });
        return;
    }
    next();
};