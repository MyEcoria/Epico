export default async (req, res, next) => {
    if (!req.body.name) {
        res.status(400).json({ status: "error", message: "Missing name" });
        return;
    }
    if (length(req.body.name) < 255) {
        res.status(400).json({ status: "error", message: "Invalid name, too long" });
        return
    }
    next();
};
