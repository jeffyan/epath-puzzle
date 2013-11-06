var http = require('http');

var options = {  
host: 'www.epdeveloperchallenge.com',   
port: 80,
path: '/api/init',  
method: 'POST'  
};  

var vertexList = new Array();
var currentDirection;

//reqest for new maze
var req = http.request(options, function(res) {       
					   console.log("Got response: " + res.statusCode);
					   //console.log('HEADERS: ' + JSON.stringify(res.headers));  
					   res.on('data', function(chunk) {  
							  console.log("Body: \n" + chunk);
							  var data = JSON.parse(chunk);
							  //var vertexList = Array();
							  var moveOptions = {
								statusCode: res.statusCode,
								data: data,
								currentCoords: {x: 0,y : 0}
							  };

							  startMoving(moveOptions);
					   });   
});   
req.end();

//start moving
var startMoving = function(moveOptions) {
	if (moveOptions.statusCode == '200') {
		var direction = pickDirection(moveOptions);
		
		if (direction == 'JUMP') {
			var jumpto = vertexList.pop();
			console.log("Jump to: " + jumpto.x + ',' + jumpto.y);
			
			var options = {  
				host: 'www.epdeveloperchallenge.com',   
				port: 80,
				path: '/api/jump?mazeGuid=' + moveOptions.data.currentCell.mazeGuid + '&x=' + jumpto.x + '&y=' + jumpto.y,  
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'contentType': 'application/x-www-form-urlencoded'
				}
			};
			
			var req = http.request(options, function(res) {       
								   res.on('data', function(chunk) {  
										  console.log("Body: \n" + chunk);
										  
										  var data = JSON.parse(chunk);
										  
										  if (data.currentCell.atEnd == false) {
										  var moveOptions = {
										  statusCode: res.statusCode,
										  data: data,
										  currentCoords: {x: data.currentCell.x, y: data.currentCell.y}
										  };
										  
										  startMoving(moveOptions);	
										  }
										  
										  });
								   });    
			
			req.end();
		} else {
			console.log("Direction: " + direction);
			var options = {  
				host: 'www.epdeveloperchallenge.com',   
				port: 80,
				path: '/api/move?mazeGuid=' + moveOptions.data.currentCell.mazeGuid + '&direction=' + direction,  
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'contentType': 'application/x-www-form-urlencoded'
				}
			};
			
			var req = http.request(options, function(res) {       
						res.on('data', function(chunk) {  
							console.log("Body: \n" + chunk);

							var data = JSON.parse(chunk);
							   
							if (data.currentCell.atEnd == false) {
							   var moveOptions = {
								statusCode: res.statusCode,
								data: data,
								currentCoords: {x: data.currentCell.x, y: data.currentCell.y}
							   };
							   
							   startMoving(moveOptions);	
							}
							
						});
			});    

			req.end();
		}
		//console.log('well then' + moveOptions.currentDirection);
	}//code 200
}//startMoving

var pickDirection = function (moveOptions) {
	//if the cell has more than 1 unexplored direction, push into array
	var count = 0;
	if (moveOptions.data.currentCell.north == 'UNEXPLORED') {
		count++;
	} 
	if (moveOptions.data.currentCell.east == 'UNEXPLORED') {
		count++;
	} 
	if (moveOptions.data.currentCell.west == 'UNEXPLORED') {
		count++;
	} 
	if (moveOptions.data.currentCell.south == 'UNEXPLORED') {
		count++;
	}
	if (count > 1) {
		vertexList.push({x: moveOptions.data.currentCell.x, y: moveOptions.data.currentCell.y});
	}
	
	if (currentDirection == null) {
		if (moveOptions.data.currentCell.north == 'UNEXPLORED') {
			currentDirection = 'NORTH';
		} 
		if (moveOptions.data.currentCell.east == 'UNEXPLORED') {
			currentDirection = 'EAST';
		} 
		if (moveOptions.data.currentCell.west == 'UNEXPLORED') {
			currentDirection = 'WEST';
		} 
		if (moveOptions.data.currentCell.south == 'UNEXPLORED') {
			currentDirection = 'SOUTH';
		}

		return currentDirection;
	} else {
		//move in same direction
		if (currentDirection == 'NORTH' && moveOptions.data.currentCell.north == 'UNEXPLORED') {
			return 'NORTH';
		}
		if (currentDirection == 'EAST' && moveOptions.data.currentCell.east == 'UNEXPLORED') {
			return 'EAST';
		}
		if (currentDirection == 'WEST' && moveOptions.data.currentCell.west == 'UNEXPLORED') {
			return 'WEST';
		}
		if (currentDirection == 'SOUTH' && moveOptions.data.currentCell.south == 'UNEXPLORED') {
			return 'SOUTH';
		}

		if (moveOptions.data.currentCell.north != 'UNEXPLORED' && 
			moveOptions.data.currentCell.east != 'UNEXPLORED' &&
			moveOptions.data.currentCell.west != 'UNEXPLORED' &&
			moveOptions.data.currentCell.south != 'UNEXPLORED')
		{
			//jump
			return 'JUMP';
		} else {
			//change of direction
			if (currentDirection != 'NORTH' && moveOptions.data.currentCell.north == 'UNEXPLORED') {
				currentDirection = 'NORTH'
			}
			if (currentDirection != 'EAST' && moveOptions.data.currentCell.east == 'UNEXPLORED') {
				currentDirection = 'EAST'
			}
			if (currentDirection != 'WEST' && moveOptions.data.currentCell.west == 'UNEXPLORED') {
				currentDirection = 'WEST'
			}
			if (currentDirection != 'SOUTH' && moveOptions.data.currentCell.south == 'UNEXPLORED') {
				currentDirection = 'SOUTH'
			}			
		}
		
		return currentDirection;
	}
}
