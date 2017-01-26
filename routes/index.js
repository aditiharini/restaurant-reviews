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
    
    res.render('login');
    
});

router.post('/login', passport.authenticate('local-login', {failureRedirect:'/login', successRedirect:'/search'}));

router.get('/search', function(req, res, next){
    res.render('search');
});
router.get('/settings', function(req, res, next){
    res.render('settings');
    
});
router.get('/signup', function(req, res, next){
	res.render('signup');
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
			return res.send({message:"error please try again"});
		}
		if(user){
			console.log(user);
			return res.send({message:"username exists"});
		
		}
		var newUser = new User();
		newUser.username = username;
		newUser.password = newUser.generateHash(password);
		newUser.name = name;
		newUser.save(function(err){
			if(err){
				console.log(err);
				return res.send({message:"error cannot save please try again"});
			}
			else{
				return res.send({redirect:'/login'});
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

router.get('/reviews', function(req, res, next){
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

});
router.get('/search', function(req, res, next){
	res.render('search');

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
