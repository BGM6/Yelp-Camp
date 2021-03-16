const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
router.get('/register', (req, res) => {
		res.render('users/register');
})
router.post('/register', catchAsync(async (req, res, next) => {
		try {
				const { email, password, username } = req.body;
				const user = new User({email, username})
				const registeredUser = await User.register(user, password);
				req.login(registeredUser, err => {
						if(err) return next(err);
						req.flash('success','Welcome to Yelp Camp!')
						res.redirect('/campgrounds');
				})
		} catch(err) {
				req.flash('error', err.message);
				res.redirect('/register');
		}
}))

router.get('/login', (req, res) => {
		res.render('users/login');
})

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), async (req, res) => {
		const { username } = req.body;
		req.flash('success', `Welcome back!, ${username}`)
		const redirectUrl = req.session.returnTo || '/campgrounds';
		delete req.session.returnTo;
		res.redirect(redirectUrl);
})

router.get('/logout', (req, res) => {
		req.logout();
		req.flash('success', 'You have logged out')
		res.redirect('/campgrounds');
})

module.exports = router;
