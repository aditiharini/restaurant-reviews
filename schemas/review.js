var mongoose  = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user.js');

var reviewSchema = new Schema({
	author: User.schema,
	numLikes: {type:Number, default:0},
	restaurant: String,
	location:{city: String, state: String},
	cuisine: String,
	rating: Number,
	content: String
});

var Review = mongoose.model('Review', reviewSchema);
module.exports = Review;