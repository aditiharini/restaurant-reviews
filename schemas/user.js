var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
var userSchema = new Schema({
	name: String,
	email: String,
	password: String,
	age: Number,
	gender: String,
	ethnicity: String,
	location: String,
	dietaryRestrictions: {
		vegetarian: Boolean, 
		vegan: Boolean, 
		kosher: Boolean, 
		halal: Boolean, 
		nutAllergies: Boolean}
});
userSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
userSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.password);
};
var User = mongoose.model('User',userSchema);
module.exports = User;