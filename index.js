const express = require('express');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const PORT = 5000 || process.env;
const path = require('path')

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

//ejs setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

//index route
app.get('/campgrounds', async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', {campgrounds});
})

//create
app.get('/campgrounds/new', (req, res) => {
		res.render('campgrounds/new')
})

app.post('/campgrounds', async (req, res) => {
		const campground = new Campground(req.body.campground)
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`)
		// res.send(req.body);
})

//show route
app.get('/campgrounds/:id', async (req, res) => {
		const campground = await Campground.findById(req.params.id)
		res.render('campgrounds/show', {campground});
})

//update route
app.get('/campgrounds/:id/edit', async (req, res) => {
		
})

app.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}`)
});
