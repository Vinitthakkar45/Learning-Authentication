const profileController = (req, res) => {
    res.render('profile',{user:req.user});
}

const checkAuth = (req, res, next) => {
    if(!req.user)res.redirect("/auth/login");
    else next();
}

export {profileController, checkAuth};