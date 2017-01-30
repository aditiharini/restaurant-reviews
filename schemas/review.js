var mongoose  = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user.js');
// remove restaurant name and location
var reviewSchema = new Schema({
	author: User.schema,
	numLikes: {type:Number, default:0},
	location:{city: String, state: String},
	cuisine: String,
	rating: Number,
	content: String,
	restaurantId: String
});

var Review = mongoose.model('Review', reviewSchema);
module.exports = Review;