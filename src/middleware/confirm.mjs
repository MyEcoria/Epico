import { isUUID } from "../../modules/utils.mjs";

export default async (req, res, next) => {
    if (!req.params.id) {
        res.status(400).json({ status: "error", message: "Missing id" });
        return;
    }
    if (!isUUID(req.params.id)) {
        res.status(400).json({ status: "error", message: "Invalid id" });
        return;
    }
    next();
};