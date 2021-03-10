const express = require('express');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const PORT = 5000 || process.env;
const path = require('path')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas');
const Review = require('./models/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connect error:'))
db.once('open', () => {
		console.log('Database connected');
});

const app = express()
//middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'));

//ejs setup
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

//index route
app.get('/campgrounds', catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', {campgrounds});
}))

//Middleware we created
const validateCampground = (req, res, next) => {
		const { error } = campgroundSchema.validate(req.body);
		if(error) {
				console.log(error);
				const msg = error.details.map(el => el.message).join(',')
				throw new ExpressError(msg, 400 )
		} else {
				next();
		}
}

const validateReview = (req, res, next) => {
		const {error} = reviewSchema.validate(req.body);
		if(error) {
				const msg = error.details.map(el => el.message).join(',')
				throw new ExpressError(msg, 400);
		} else {
				next();
		}
}

//create
app.get('/campgrounds/new', (req, res) => {
		res.render('campgrounds/new')
})


app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
		// if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
		const campground = new Campground(req.body.campground)
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`)
		// res.send(req.body);)
}))

//show route
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id).populate('reviews');
		// console.log(campground)
		res.render('campgrounds/show', {campground});
}))

//update route
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id)
		res.render('campgrounds/edit', {campground});
}))

app.put('/campgrounds/:id',validateCampground, catchAsync(async (req, res) => {
		const {id} = req.params;
		const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
		res.redirect(`/campgrounds/${campground._id}`);
}))

//delete
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
		const {id} = req.params;
		await Campground.findByIdAndDelete(id);
		res.redirect('/campgrounds');
}))


//Review Route
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync( async (req, res) => {
		const { id, reviewId } = req.params;
		await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});
		await Review.findByIdAndDelete(reviewId);
		res.redirect(`/campgrounds/${id}`);
}));


//err handling
app.all('*', (req, res, next) => {
		next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
		const {statusCode = 500} = err;
		if(!err.message) err.message = 'Looks like something went wrong :{'
		res.status(statusCode).render('error', {err});
})

app.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}`)
});
