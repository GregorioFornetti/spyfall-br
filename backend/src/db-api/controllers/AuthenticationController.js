

export function getAuthPage(req, res) {
    return res.sendFile('src/views/auth.html', {root: '.'})
}

export function login(req, res) {
    req.session.regenerate(function (err) {
        if (err) next(err)
    
        // store user information in session, typically a user id
        req.session.password = req.body.password
    
        // save the session before redirection to ensure page
        // load does not happen before session is saved
        req.session.save(function (err) {
          if (err) return next(err)
          res.redirect('/adm')
        })
    })
}

export function logout(req, res) {
    req.session.destroy(function(){
        console.log("user logged out.")
     })
     res.redirect('/auth')
}