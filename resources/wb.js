$(function(){

	// This demo depends on the canvas element
	if(!('getContext' in document.createElement('canvas'))){
		alert('Sorry, it looks like your browser does not support canvas!');
		return false;
	}

	// The URL of your web server (the port is set in app.js)
	var url = window.location.hostname;

	var doc = $(document),
		win = $(window),
		canvas = $('#paper'),
		ctx = canvas[0].getContext('2d'),
		instructions = $('#instructions');
		
		
	var pencil;
	
	// Generate an unique ID
	var id = Math.round($.now()*Math.random());
	
	// A flag for drawing activity
	var drawing = false;

	var clients = {};
	var cursors = {};

	var socket = io.connect(url);
	
	socket.on('moving', function (data) {
		
					
		if(! (data.id in clients)){
			// a new user has come online. create a cursor for them
			cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
		}
		
		// Move the mouse pointer
		cursors[data.id].css({
			'left' : data.x,
			'top' : data.y
		});
		
		// Is the user drawing?
		if(data.drawing && clients[data.id]){
			
			// Draw a line on the canvas. clients[data.id] holds
			// the previous position of this user's mouse pointer
			
			drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
		}
		if(data.mode)
		{
			ctx.lineWidth=10;
                    ctx.globalCompositeOperation = "destination-out";
                    ctx.arc(lastX, lastY, 5, 0, Math.PI * 2, false);
                    ctx.fill();
		}
		
		// Saving the current client state
		clients[data.id] = data;
		clients[data.id].updated = $.now();
	});

	var prev = {};
	
	canvas.on('mousedown',function(e){
		e.preventDefault();
		drawing = true;
		prev.x = e.pageX;
		prev.y = e.pageY;
		
		// Hide the instructions
		instructions.fadeOut();
	});
	
	doc.bind('mouseup mouseleave',function(){
		drawing = false;
	});

	var lastEmit = $.now();

	doc.on('mousemove',function(e){
		if($.now() - lastEmit > 30){	
		
			
			socket.emit('mousemove',{
				'x': e.pageX,
				'y': e.pageY,
				'drawing': drawing,
				'id': id
			});
			lastEmit = $.now();
		}
		
		// Draw a line for the current user's movement, as it is
		// not received in the socket.on('moving') event above
		
		if(drawing){
			
			drawLine(prev.x, prev.y, e.pageX, e.pageY);
			
			prev.x = e.pageX;
			prev.y = e.pageY;
		}
	});

	// Remove inactive clients after 10 seconds of inactivity
	setInterval(function(){
		
		for(ident in clients){
			if($.now() - clients[ident].updated > 10000){
				
				// Last update was more than 10 seconds ago. 
				// This user has probably closed the page
				
				cursors[ident].remove();
				delete clients[ident];
				delete cursors[ident];
			}
		}
		
	},10000);

	function drawLine(fromx, fromy, tox, toy){
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.stroke();
	}
	
	
	/*---------------------------------------------*/
	
		var paint;
	var clickX = new Array();
	var clickY = new Array();
	var clickDrag = new Array();
	var mouseY;
	var mouseX;
    var canvasOffset = $("#paper").offset();
    var offsetX = canvasOffset.left;
    var offsetY = canvasOffset.top;
    var isMouseDown = false;
	var mode;
	$('#clearbtn').click(function(e){
		mode='';
		ctx.lineWidth=0;
		mouseX = e.pageX - this.offsetLeft;
		mouseY = e.pageY - this.offsetTop;
			
		paint = true;
		addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
		redraw();
	});
	function redraw(){
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clears the canvas
		ctx.strokeStyle = "#0000";
		ctx.lineJoin = "round";
		ctx.lineWidth = 0;
			
		for(var i=0; i < clickX.length; i++) {		
			ctx.beginPath();
			if(clickDrag[i] && i){
				ctx.moveTo(clickX[i-1], clickY[i-1]);
			}else{
				ctx.moveTo(clickX[i]-1, clickY[i]);
			}
			ctx.lineTo(clickX[i], clickY[i]);
			ctx.closePath();
			//ctx.stroke();
		  }
	}
	function addClick(x, y,dragging)
	{
	  clickX.push(x);
	  clickY.push(y);
	  clickDrag.push(dragging);
	}
		
		function handleMouseDown(e) {
            mouseX = parseInt(e.clientX - offsetX);
            mouseY = parseInt(e.clientY - offsetY);

            // Put your mousedown stuff here
            lastX = mouseX;
            lastY = mouseY;
            isMouseDown = true;
        }

        function handleMouseUp(e) {
            mouseX = parseInt(e.clientX - offsetX);
            mouseY = parseInt(e.clientY - offsetY);

            // Put your mouseup stuff here
            isMouseDown = false;
        }

        function handleMouseOut(e) {
            mouseX = parseInt(e.clientX - offsetX);
            mouseY = parseInt(e.clientY - offsetY);

            // Put your mouseOut stuff here
            isMouseDown = false;
        }

        function handleMouseMove(e) {
            mouseX = parseInt(e.clientX - offsetX);
            mouseY = parseInt(e.clientY - offsetY);

            // Put your mousemove stuff here
            if (isMouseDown) {
                ctx.beginPath();
                if (mode == "eraser") {
					ctx.lineWidth=10;
                    ctx.globalCompositeOperation = "destination-out";
                    ctx.arc(lastX, lastY, 5, 0, Math.PI * 2, false);
                    ctx.fill();
					
					if($.now() - lastEmit > 30){
					socket.emit('mousemove',{
						'x': e.pageX,
						'y': e.pageY,
						'mode':'eraser',
						'id': id
					});
					lastEmit = $.now();
					}
                    
                } else if(mode == "pencil"){
					ctx.lineWidth=3;
					ctx.globalCompositeOperation = "source-over";
                    ctx.moveTo(lastX, lastY);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.stroke();
                }
                lastX = mouseX;
                lastY = mouseY;
            }
        }

        $("#paper").mousedown(function (e) {
            handleMouseDown(e);
        });
        $("#paper").mousemove(function (e) {
            handleMouseMove(e);
        });
        $("#paper").mouseup(function (e) {
            handleMouseUp(e);
        });
        $("#paper").mouseout(function (e) {
            handleMouseOut(e);
        });
        $("#eraser").click(function () {
            mode = "eraser";
        });
		$("#Pen").click(function () {
            mode = "pencil";
			ctx.lineWidth=0;
        });
	

});