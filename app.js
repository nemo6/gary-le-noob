var fs             = require('fs')
var express        = require('C:/Users/USERNAME/AppData/Roaming/npm/node_modules/express'); // '/usr/local/lib/node_modules/express/' sur Linux avec un npm i global
var expressSession = require('C:/Users/USERNAME/AppData/Roaming/npm/node_modules/express-session') // '/usr/local/lib/node_modules/express-session/'
var app            = express();
var server         = require('http').createServer(app);
var io             = require('C:/Users/USERNAME/AppData/Roaming/npm/node_modules/socket.io')(server); // '/usr/local/lib/node_modules/socket.io/'
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

	}else{

		color = req.session.user
	}

	fs.readFile("index.html", 'utf8', function(err, data){

		res.end(data)

	})
	
})

server.listen(port)

var size

io.on('connection', function (socket) {

	// Get size of grid

	socket.on("size", (size) => {

		if ( Object.keys(player).length < 10 ){

			if( player[color] == undefined ){

				player[color] = { x:getRandomInt(size)+1, y:getRandomInt(size)+1 }

				console.log("Nouveau joueur")

				console.log(color,player[color])

				position = player[color]

				new_player = true

				io.emit( "nouveau_joueur", {color,position,new_player,player} )
			
			}else{

				console.log("ce joueur existe déjà ...")

				new_player = false

				position = player[color]

				io.emit( "nouveau_joueur", {color,position,new_player,player} )
			}

		}
		

 	})

	// player move
	
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
