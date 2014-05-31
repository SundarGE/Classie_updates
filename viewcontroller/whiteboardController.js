module.exports.controller = function(app){
	app.get('/whiteboard', function(req, res){
		res.render('whiteboard');
	});
};