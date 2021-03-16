module.exports.isLoggedIn = (req, res, next) => {
		//route protecting
		if(!req.isAuthenticated()) {
				req.session.returnTo = req.originalUrl;
				req.flash('error', 'You must be signed in');
				return res.redirect('/login');
		}
		next();
}


