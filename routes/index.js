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
	console.log("got to get user reviews");
	Review.find({'author._id':req.user._id}, function(err, reviews){
		if(err){
			console.log(err);
			res.send({message:'error'});
		}
		else if(reviews.length>0){
			var reviewRestaurant = [];
			console.log(reviews);
			res.send({message:'success', reviews: reviews});
		}
		else{
			console.log("no reviews");
			res.send({message:'no reviews'});
		}

	});
	
});
router.post('/reviews', function(req, res, next){
	if(req.body.action=='delete'){
		Review.findOne({_id:req.body.id}, function(err, review){
			if(err){
				console.log(err);
				res.send({message:"error"});

			}
			else{
				Restaurant.findOne({id:review.restaurantId}, function(err, restaurant){
					if(err){
						console.log(err);
						return res.send({message:"error"});
					}
					else{
						Review.remove({_id:req.body.id}, function(err){
							if(err){
								console.log(err);
								return;
							}
							var allReviews = restaurant.reviews;
							if(allReviews.length==1){
								//remove this restaurant
								Restaurant.remove({_id:restaurant._id}, function(err){
									if(err){
										console.log(err);
										return res.send({message:"error"});
									}
									return res.send({message:'success'});
								
								});
							}
							else{
								var removedReview = restaurant.reviews.id(req.body.id).remove();
								restaurant.save(function(err){
									if(err){
										console.log(err);
										return res.send({message:"error"});
									}
									return res.send({message:"success"});
								});
								// delete this review from the list
							}
						});
						// delete the review

					}

				});
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
		console.log(req.body.content);
		var reviewObj = {
			content:req.body.content,
			rating:req.body.rating,
			author:req.user,
			restaurantId:req.body.id

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
								console.log(err);
								res.send({loggedIn:true, message:'error'});
							}
							else{
								res.send({loggedIn:true, message:'success'});
							}

						});


					}
					else{
						Restaurant.create({id:req.body.id, name:req.body.name}, function(err, newRestaurant){
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
			else if(restaurant){
				console.log(restaurant);
				if(req.user){
					var currentUser;
					var reviewAuthor;
					console.log('inside conditional');
					var reviews = restaurant.reviews;
					var validReviews = [];
					var review_match = [];
					User.findOne({_id:req.user._id}, function(err, sessionUser){
						if(err){
							throw err;
						}
						if(sessionUser){
							currentUser = sessionUser;
						reviews.forEach(function(review, index){
							User.findOne({_id:review.author._id}, function(err, reviewUser){
								if(err){
									throw err;
								}
								if(reviewUser){
									reviewAuthor = reviewUser;
									console.log(reviewAuthor);
							var numMatches = 0;
							var isValid = false;
							if(currentUser.dietaryRestrictions.vegetarian===reviewAuthor.dietaryRestrictions.vegetarian){
								console.log('got to veg');
								numMatches+=1;
								isValid = true;
							}
							if(currentUser.dietaryRestrictions.vegan===reviewAuthor.dietaryRestrictions.vegan){
								console.log('got to vegan');
								numMatches +=1;
								isValid = true;
							}
							if(currentUser.dietaryRestrictions.kosher===reviewAuthor.dietaryRestrictions.kosher){
								console.log('got to kosher');
								numMatches +=1;
								isValid = true;

							}
							if(currentUser.dietaryRestrictions.halal===reviewAuthor.dietaryRestrictions.kosher){
								console.log('got to halal');
								numMatches +=1;
								isValid = true;
							}
							if(isValid){
								validReviews.push(review);
								var pair = [review, numMatches];
								review_match.push(pair);

							}

							if(index==reviews.length-1){
								if(validReviews.length===0){
									return res.send({reviews:validReviews});
								}
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
										res.send({message:"success", reviews:sortedReviews});
									}
								});
								
							}
									return;
								}
							});
			


						});
								
							}

						});



				}
				else{
					res.send({message:"success", reviews:restaurant.reviews});
				}
			}
			else{
				console.log("restaurant not found");
				res.send({message:"error"});
			}
		});

		
	}
	if(req.body.viewAllReviews){
		console.log('got to view all reviews');
		Restaurant.findOne({id:req.body.id}, function(err, restaurant){
			if(err){
				throw err;
			}
			if(restaurant){
				res.send({reviews:restaurant.reviews});
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
