import passport from "passport";

const googleController = passport.authenticate('google', {
    scope: ['profile', 'email', '']
});

const googleRedirectController = (req, res) => {
    res.redirect('/profile/');
}

const loginController = (req, res) => {
    res.render('login',{user:req.user});
}
const logoutController = (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
}

export { loginController, logoutController, googleController, googleRedirectController }