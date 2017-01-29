var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
var userSchema = new Schema({
	name: String,
	username: String,
	password: String,
	age: Number,
	gender: String,
	ethnicity: String,
	location: {
		state: String, 
		city: String
	}, 
	dietaryRestrictions: {
		vegetarian: {type:Boolean, default:false}, 
		vegan: {type:Boolean, default:false}, 
		kosher: {type:Boolean, default:false}, 
		halal: {type:Boolean, default:false}, 
		nutAllergies: {type:Boolean, default:false}
	}
});
userSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
userSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.password);
};
var User = mongoose.model('User',userSchema);
module.exports = User;