var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var User = require('../schemas/user.js');
var Review = require('../schemas/review.js');
var Restaurant = require('../schemas/restaurant.js');

/* GET home page. */

router.get('/login', function(req, res, next){
	passport.authenticate('local-login', function(err, user, info){
		if(err){
			return res.send({message:err});
		}
		if(!user){
			return res.send({message:"no matching user"});
		}
		req.logIn(user, function(err){
			if(err){
				return res.send({message:'error'});
			}
			console.log('login user');
			console.log(req.user);
			req.session.user = req.user;
			res.send({message:'success'});

		});
		

	})(req, res, next);
    
    // res.render('login', {message:req.flash('loginMessage')});
    
});

router.get('/settings', isLoggedIn, function(req, res, next){
    res.render('settings');
    
});

router.post('/settings', function(request, response, next) {

	if (request.body.id == "ethnicity") {
		User.findOne({_id:request.user._id}, function(err, user){
		if(err){
			throw err;
		}
		else {
			response.send({data: user});
		}

		});
	}
	else if (request.body.id == "buttoninput"){
		User.findOne({_id: request.user._id}, function(err, person) {
		if (err) {
			throw err; 
		}
		if (person) {
			person.gender = request.body.gender; 
			person.age = request.body.age; 
			person.ethnicity = request.body.ethnicity; 
			person.location.state = request.body.state; 
			person.location.city = request.body.city; 
			person.dietaryRestrictions.vegetarian = request.body.vegetarian;
			person.dietaryRestrictions.vegan = request.body.vegan; 
			person.dietaryRestrictions.kosher = request.body.kosher; 
			person.dietaryRestrictions.halal = request.body.halal; 
			person.dietaryRestrictions.nutAllergies = request.body.nutAllergies; 
 			person.save(function(err) {
				if (err) {
					console.log(err); 
				}
				else{
					console.log(person); 
					response.send({data: person});

				}
 
			});


		}
		
	}); 
	}
}); 

router.get('/signup', function(req, res, next){
	res.render('signup', {message:req.flash('signupMessage')});
});

router.post('/signup', function(req, res, next){
	console.log('got to post');
	var username = req.body.username;
	var password = req.body.password;
	var name = req.body.name;
	console.log(username);

	// find if user already exists by checking username and email
	// if already exists some error message
	// if not, add user to database and sign in
	User.findOne({username:username}, function(err, user){
		console.log('got here');
		if(err){
			console.log(err);
			return res.send({message:'error'});
		}
		if(user){
			console.log(user);
			return res.send({message:'username is taken'});
		
		}
		var newUser = new User();
		newUser.username = username;
		newUser.password = newUser.generateHash(password);
		newUser.name = name;
		newUser.save(function(err){
			if(err){
				console.log(err);
				return res.send({message:"error"});
			}
			else{
				return res.send({message:'success'});
			}
			});
		
	});

});

router.get('/auth/google', passport.authenticate('google', {scope:['profile email']}));

router.get('/auth/google/callback', passport.authenticate('google'), function(req,res){
	console.log(req.user);
	res.redirect('/map');

});

router.get('/reviews', isLoggedIn, function(req, res, next){
	console.log(req.user);
	Review.find({'author._id':req.user._id}, function(err, reviews){
		if(err){
			console.log(err);
			res.render('reviews', {hasReviews: false, message:"There was an error loading your reviews"});
		}
		else if(reviews){
			console.log(reviews);
			res.render('reviews', {hasReviews: true, reviews:reviews});
		}
		else{
			console.log("no reviews");
			res.render('reviews', {hasReviews: false, message:'You have not made any reviews yet.'});
		}

	});
	
});
router.post('/reviews', function(req, res, next){
	if(req.body.action=='create'){
		var review = {
			restaurant: req.body.restaurant,
			cuisine: req.body.cuisine,
			rating: req.body.rating,
			author: req.user,
			content: req.body.content,
			location:{city:req.body.city, state:req.body.state}
		};
		Review.create(review, function(err, review){
			if(err){
				return res.send({message:err});
			}
			if(review){
				return res.send({newReview:review});
			}
			return res.send({message:"unknown error"});
		});
	}
	if(req.body.action=='delete'){
		Review.remove({_id: req.body.id}, function(err){
			if(err){
				console.log(err);
				res.send({wasDeleted: false, message:"There was an error deleting this review"});
			}
			else{
				res.send({wasDeleted: true, message:"successfully deleted"});
			}
		});

	}

});

router.get('/map', function(req, res, next){
	console.log(req.user);
	var loggedIn = false;
	if(req.user){
		loggedIn = true;
	}
	// console.log('got to get');

	res.render('map', {loggedIn:loggedIn});
});

router.post('/map', function(req, res, next){
	console.log(req.body.query);
	if(req.body.query){
		console.log('got to get');
		Restaurant.findOne({id:req.body.id}, function(err, restaurant){
			console.log('got to inside query');
			if(err){
				console.log(err);
				return res.send({restaurantExists: false, error:'there was an error'});
			}
			else if(restaurant){
				console.log(restaurant);
				return res.send({restaurantExists: true, restaurant:restaurant});
			}
			//if there's no matching restaurant don't send anything
			else{
				console.log('no restaurant');
				return res.send({restaurantExists:false,});
			}
		});
	}
	if(req.body.isReview){
		console.log('got to post review');
		console.log('check login');
		console.log(req.session.user);
		if(!req.user){
			console.log('no user');
			return res.send({loggedIn:false});
		}
		var reviewObj = {
			content:req.body.content,
			rating:req.body.rating,
			author:req.user

		};
		Review.create(reviewObj, function(err, review){
			if(err){
				console.log(err);
				return res.send({loggedIn:true, message:'error'});
			}
			if(review){
				Restaurant.findOne({id:req.body.id}, function(err, restaurant){
					if(err){
						console.log(err);
						res.send({loggedIn:true, message:'error'});
					}
					else if(restaurant){
						restaurant.reviews.push(review);
						restaurant.save(function(err){
							if(err){
								res.send({loggedIn:true, message:'error'});
							}
							else{
								res.send({loggedIn:true, message:'success'});
							}

						});


					}
					else{
						Restaurant.create({id:req.body.id}, function(err, newRestaurant){
							if(err){
								console.log(err);
								return res.send({loggedIn:true, message:'error'});
							}
							else if(newRestaurant){
								newRestaurant.reviews.push(review);
								newRestaurant.save(function(err){
									if(err){
										console.log(err);
										res.send({loggedIn:true,message:"error"});
									}
									else{
										res.send({loggedIn:true, message:'success'});

									}
								});
							}

						});
					}

				});
			}

		});

	}
	if(req.body.viewReview){
		console.log("request user");
		console.log(req.user);

		Restaurant.findOne({id:req.body.id}, function(err, restaurant){
			if(err){
				console.log(err);
			}
			else{
				console.log(restaurant);
				if(req.user){
					var user = req.user;
					console.log('inside conditional');
					console.log(user);
					var reviews = restaurant.reviews;
					var validReviews = [];
					var review_match = [];
					reviews.forEach(function(review, index){
						if(req.user===undefined){
							console.log('user is undefined');
						}
						console.log('for each');
						console.log(req.user);
						var numMatches = 0;
						var isValid = false;
						console.log(req.user.name+ "is my name");
						console.log(req.user.dietaryRestrictions);
						// if(req.user.dietaryRestrictions.vegetarian==review.author.dietaryRestrictions.vegetarian || req.user.dietaryRestrictions.vegan==review.author.dietaryRestrictions.vegan || req.user.dietaryRestrictions.kosher==review.author.dietaryRestrictions.kosher||req.user.dietaryRestrictions.halal==review.author.dietaryRestrictions.halal){
						// 	validReviews.push(review);
						// }
						if(req.user.dietaryRestrictions.vegetarian===review.author.dietaryRestrictions.vegetarian){
							numMatches+=1;
							isValid = true;
						}
						if(req.user.dietaryRestrictions.vegan===review.author.dietaryRestrictions.vegan){
							numMatches +=1;
							isValid = true;
						}
						if(req.user.dietaryRestrictions.kosher===review.author.dietaryRestrictions.kosher){
							numMatches +=1;
							isValid = true;

						}
						if(req.user.dietaryRestrictions.halal===review.author.dietaryRestrictions.kosher){
							numMatches +=1;
							isValid = true;
						}
						if(isValid){
							validReviews.push(review);
							var pair = [review, numMatches];
							review_match.push(pair);

						}

						if(index==reviews.length-1){
							review_match.sort(function(a,b){
								if(a[1]>b[1]){
									return -1;
								}
								if(a[1]<b[1]){
									return 1;
								}
								return 0;

							});
							var sortedReviews = [];
							review_match.forEach(function(pair, index){
								sortedReviews.push(pair[0]);
								if (index==review_match.length-1){
									res.send({reviews:sortedReviews});
								}
							});
							
						}

					});

				}
				else{
					res.send({reviews:restaurant.reviews});
				}
			}
		});

		
	}

});

router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/map');
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}

module.exports = router;
