var express = require('express');
var router = express.Router();
var passport = require('passport');

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

router.get('/auth/google', passport.authenticate('google', {scope:['profile email']}));

router.get('/auth/google/callback', 
	passport.authenticate('google', {
		failureRedirect:'/login'
	}), function(req,res){
		res.redirect('/settings');

});

module.exports = router;
