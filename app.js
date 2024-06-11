// Express initializaion
const express = require('express');
const app = express();

// Server creation
const http = require('http');
const server = http.createServer(app);

// Socket.io
const { Server } = require('socket.io');
const io = new Server(server);

const { randomId } = require('./generateId')

let rooms = {};
let lobbies = {};
let games = {};

// Root page
app.use(express.static('public'))
app.get('/', (req, res) => {
    // res.send('<h1>Hello world</h1>');
    res.sendFile(__dirname + '/public/index.html');
});

// Singleplayer page
app.get('/singleplayer', (req, res) => {
    // res.send('<h1>Hello world</h1>');
    res.sendFile(__dirname + '/public/singleplayer.html');
});

// Multiplayer page
app.get('/multiplayer', (req, res) => {
    // res.send('<h1>Hello world</h1>');
    res.sendFile(__dirname + '/public/multiplayer.html');
});


// Socket.io connection
io.on('connection', (socket) => {
    console.log('[INFO]  User has connected');
    socket.on('disconnect', () => {
        console.log('[INFO]  User has disconnected')
    });

    let lobbyId = "";
    let clientUsername = "";

    socket.on("createLobby", (username) => {
        const id = randomId();
        socket.join(id);
        lobbyId = id;
        console.log("[INFO]  New lobby with id: '" + id + "'");
        clientUsername = username;

        socket.emit("createdLobby", id, username);
    });

    socket.on("joinLobby", (id, username) => {
        socket.join(id);
        lobbyId = id;
        console.log("[INFO]  User '" + username + "' joined lobby with id '" + id + "'");
        clientUsername = username;

        socket.emit("joinedLobby", id, username);
    });

    socket.on("lobbyReady", (username) => {
        lobbies[lobbyId].push(clientUsername);

        if (lobbies[lobbyId].length == 2) {
            io.to(lobbyId).emit("players", lobbies[lobbyId]);
        }

        games[lobbyId][clientUsername + "_turn"] = false;
        games[lobbyId][enemyUsername + "_turn"] = false;
    });

    let enemyUsername = "";
    socket.on("enemyPlayer", (username) => {
        enemyUsername = username;
    });

    let lastGuess = 0;
    let guess = [];

    socket.on("playerReady", (colors) => {
        games[lobbyId][clientUsername + "_colors"] = colors;
        // console.log(clientUsername + " " + games[lobbyId][clientUsername + "_colors"]);

        if (games[lobbyId][enemyUsername + "_turn"] == false) {
            games[lobbyId][clientUsername + "_turn"] = true;
        }
    
        if (games[lobbyId][enemyUsername + "_colors"] != null) {
            io.to(lobbyId).emit("gamePhase");
        }
    });

    function sendTurn() {
        if (games[lobbyId][clientUsername + "_turn"] == true) {
            socket.emit("clientTurn");
        }
        else {
            socket.emit("enemyTurn");
        }
    }

    socket.on("getColors", () => {
        socket.emit("sentColors", games[lobbyId][clientUsername + "_colors"]);
        sendTurn();
    });

    socket.on("playerShoot", (colors) => {
        guess = colors;
        lastGuess = 0;
        
        games[lobbyId][clientUsername + "_turn"] = false;
        games[lobbyId][enemyUsername + "_turn"] = true;

        for (var i = 0; i < 4; i++) {
            if (games[lobbyId][enemyUsername + "_colors"][i] == colors[i]) {
                lastGuess++;
          }
        }

        socket.to(lobbyId).emit("enemyGuess", guess, lastGuess);
        socket.emit("clientGuess", lastGuess);
        sendTurn();
    })
});

io.of("/").adapter.on("create-room", (room) => {
    rooms[room] = 0;
});

io.of("/").adapter.on("join-room", (room, id) => {
    //   console.log(`socket ${id} has joined room ${room}`);
    rooms[room] += 1;
    if (rooms[room] == 2) {
        io.sockets.to(room).emit("twoUsers", room);
        lobbies[room] = [];
        games[room] = {};
    }
});

io.of("/").adapter.on("delete-room", (room) => {
    console.log("[INFO]  Deleted room: '" + room + "'");
    delete rooms[room];
    delete games[room];
    delete lobbies[room];
})

// Server port 3000 for testing purposes
server.listen(3000, () => {
    console.log('[INFO]  Listening on *:3000');
});

// Server port 80 for live server
// server.listen(80, () => {
//     console.log('[INFO]  Listening on *:80');
// });