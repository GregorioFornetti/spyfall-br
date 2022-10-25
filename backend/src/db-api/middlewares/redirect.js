
import { password } from "../configs/index.js";

export default function redirectIfNotAuth(req, res, next) {
    if (req.originalUrl !== '/adm/' || req.session.password === password) {
        next()
    } else {
        res.redirect('/auth')
    }
}