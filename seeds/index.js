const mongoose = require('mongoose');
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

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

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
		await Campground.deleteMany({});
		for(let i = 0; i < 50; i++) {
				const random1000 = Math.floor(Math.random() * 1000);
				const price = Math.floor(Math.random() * 20 + 10)
				const camp = new Campground({
						location: `${cities[random1000].city}, ${cities[random1000].state}`,
						title: `${sample(descriptors)}, ${sample(places)}`,
						image: 'https://source.unsplash.com/collection/483251',
						description: 'Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. ' +
							'It has survived not only five centuries, but also the leap into electronic',
						price

				})
				await camp.save();
		}
}

seedDB().then(() => {
		mongoose.connection.close().then(r => console.log('Connection closed'));
})
