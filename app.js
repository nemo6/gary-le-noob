var fs             = require('fs')
var express        = require('express');
var expressSession = require('express-session')
var app            = express();
var server         = require('http').createServer(app);
var io             = require('socket.io')(server);
var port           = 8080

app.use(expressSession({
	secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

var color_id,
player = {}

function getRandomInt(max){
	return Math.floor(Math.random() * Math.floor(max))
}

function getRandomColor() {
	let letters = '0123456789ABCDEF'
	let color = '#'
	for (var i = 0; i < 6; i++) {
	color += letters[Math.floor(Math.random() * 16)]
	}
	return color;
}

app.get('/', function (req, res) {

	res.writeHead(200,{'content-type':'text/html;charset=utf8'})

	if ( !req.session.user ){

		color = getRandomColor()

	    req.session.user = color

	    console.log(req.session.user)

	}else{

		color = req.session.user

		console.log(req.session.user)
	}

	fs.readFile("index.html", 'utf8', function(err, data){

		res.end(data)

	})
	
})

server.listen(port)

var size

new_player = false

io.on('connection', function (socket) {

	// Get size of grid

	socket.on("size", (size) => { 

		if( player[color] == undefined ){

			player[color] = { x:getRandomInt(size)+1, y:getRandomInt(size)+1 }

			console.log(size,player[color],Object.keys(player).length)

			position = player[color]

			io.emit( "nouveau_joueur", {player,color,position} )
		
		}else{

			position = player[color]

			io.emit( "nouveau_joueur", {player,color,position} )
		}

		

 	})

	// Player move
	
	socket.on("move", (data) => {

		player[data.color] = data.position

		socket.broadcast.emit( "move_player", { last_position:data.last_position, position:data.position, color:data.color } )
	})

	// Liste des joueurs

	socket.on("list_of_player", function(message) {

		io.to(socket.id).emit("list_of_player_results", player )

	})
	
})

console.log(`Le contenu du fichier est afficher sur le localhost:${port}`)
