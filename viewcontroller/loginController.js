module.exports.controller = function(app){
	app.get('/login', function(req, res){
		res.render('login');
	});
};