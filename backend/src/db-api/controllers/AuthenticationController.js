
import { admPath } from '../../configs/index.js'
export function getAuthPage(req, res) {
    return res.sendFile('frontend/auth.html', {root: '..'})
}

export function login(req, res) {
    req.session.regenerate(function (err) {
        if (err) next(err)
        
        req.session.password = req.body.password
    
        req.session.save(function (err) {
          if (err) return next(err)
          res.redirect(admPath)
        })
    })
}

export function logout(req, res) {
    req.session.destroy(function(){
        console.log("user logged out.")
     })
     res.redirect(`${admPath}/auth`)
}