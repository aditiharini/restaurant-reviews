var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var User = require('../schemas/user.js');
var Review = require('../schemas/review.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next){
    
    res.render('login', {message:req.flash('loginMessage')});
    
});

router.post('/login', passport.authenticate('local-login', {failureRedirect:'/login', successRedirect:'/search'}));


router.post ('/search', function(req, res, next) {
	Review.find({restaurant: {
                '$regex': req.body.name,
                 $options: "i"
    }}, function(err, reviews) {
    	if (err) {
    		throw err; 
    	}
    	res.send({
    		data: reviews
    	}); 
    }); 
}); 
router.get('/settings', isLoggedIn, function(req, res, next){
    res.render('settings');
    
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
			req.flash('signupMessage', "There was an error. Please try again.");
			return res.redirect('/signup');
		}
		if(user){
			console.log(user);
			req.flash('signupMessage', 'This username is taken');
			return res.redirect('/signup');
		
		}
		var newUser = new User();
		newUser.username = username;
		newUser.password = newUser.generateHash(password);
		newUser.name = name;
		newUser.save(function(err){
			if(err){
				console.log(err);
				req.flash('signupMessage', 'There was an error. Please try again.');
				return res.redirect('/signup');
			}
			else{
				return res.redirect('/login');
			}
			});
		
	});

});

router.get('/auth/google', passport.authenticate('google', {scope:['profile email']}));

router.get('/auth/google/callback', 
	passport.authenticate('google', {
		failureRedirect:'/login'
	}), function(req,res){
		res.redirect('/settings');

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
router.get('/search', isLoggedIn, function(req, res, next){
	res.render('search');

});

router.post('/search', function(req, res, next){
	// this should filter by author of the review
	// should add filter options to the search bar
	console.log('got to post');
	Review.find({restaurant: {
        $regex: req.body.name,
         $options: "i"
    }, 
    'author.dietaryRestrictions.vegetarian':req.user.dietaryRestrictions.vegetarian,
    'author.dietaryRestrictions.vegan':req.user.dietaryRestrictions.vegan,
	'author.dietaryRestrictions.kosher':req.user.dietaryRestrictions.kosher,
	'author.dietaryRestrictions.halal':req.user.dietaryRestrictions.halal}, function(err, reviews) {
    	if (err) {
    		console.log(err);
    		throw err; 
    	}
    	if(reviews){
    		console.log(reviews);
    		res.send({
    		data: reviews
    		});

    	}
    	
 
    }); 
});

router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/login');
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}

module.exports = router;
