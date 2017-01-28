var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Review = require('./review.js');
var restaurantSchema = new Schema({
	id: String,
	name: String,
	reviews:[Review.schema]

});

var Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;