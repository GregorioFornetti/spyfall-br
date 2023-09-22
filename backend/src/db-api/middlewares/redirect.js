
import { password } from "../../configs/index.js";
import { admPath } from "../../configs/index.js";

export default function redirectIfNotAuth(req, res, next) {
    if (req.originalUrl !== `${admPath}/` || req.session.password === password) {
        next()
    } else {
        res.redirect(`${admPath}/auth`)
    }
}