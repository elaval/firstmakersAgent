(function() {
    // ================ Base Setup ========================
// Include Hapi package
var Hapi = require('hapi');
var _ = require('lodash');
const boardManager = require("../models/board.js");



// Create Server Object
var server = new Hapi.Server();

// Define PORT number
server.connection({port: 7002});
var io = require('socket.io')(server.listener);

io.on('connection', function (socket) {
    
    socket.emit('Oh hii!');

    socket.on('burp', function () {
        socket.emit('Excuse you!');
    });

    socket.emit("event", 123)
});
/*
server.register({
    register: require('hapi-io')
});

exports.register = function(server, options, next) {
    
      io = server.plugins['hapi-io'].io;
      socket = request.plugins['hapi-io'].socket

      window.setInterval(() => socket.emit("event", 123), 1000);
      ;
    
};
*/

let myboard;

// =============== Routes for our API =======================
server.route({
    method: 'PUT',      // Methods Type
    path: '/api/pins/{id}',  // Url
    handler: function (request, reply) { //Action

        const pinNumber = request && request.params && +request.params.id;
        
        if (myboard && myboard.pins) {
            const value = +request.payload;
            myboard.digitalWrite(pinNumber,value)
            const newValue = myboard.pins[pinNumber].value;
            
            reply({
                statusCode: 200,
                message: 'Getting All User Data',
                data: newValue
            });
            
        } else {
            res.json("no board");
        }
            

    }
});

server.route({
    method: 'PATCH',      // Methods Type
    path: '/api/pins/{id}',  // Url
    handler: function (request, reply) { //Action

        const pinNumber = request && request.params && +request.params.id;
        

        if (myboard && myboard.pins) {
            const pin = myboard.pins[pinNumber];
            const payload = request.payload; // GET INPUT FROM REUEST BODY

            // Change mode if a mode attribute is provided in the payload
            if (_.isNumber(payload.mode)) {
                boardManager.pinMode(pinNumber,payload.mode)
                // Check if mode is supportde by the pin (it is in pin.supportedModes)
                const index = _.findIndex(pin.supportedModes, d => d === payload.mode);
                if ( index > -1) {
                    myboard.pinMode(pinNumber,payload.mode);
                    myboard.digitalRead(pinNumber, () => {});
                };
                
            }

            if (!isNaN(parseFloat(payload.value)) && isFinite(payload.value)) {

                myboard.digitalWrite(pinNumber,payload.value)
            }
            
            reply({
                statusCode: 200,
                message: 'Getting All User Data',
                data: myboard.pins[pinNumber]
            });
            
        } else {
            res.json("no board");
        }
            

    }
});

function isValidMode(mode, pin) {
    if (pin && pin.modes) {
        pin.modes.lookAt
    }
}

server.route({
    method: 'GET',      // Methods Type
    path: '/api/pins/{id}',  // Url
    handler: function (request, reply) { //Action
        const pinNumber = request && request.params && +request.params.id || 0;
        
        if (myboard && myboard.pins) {
            
            reply(myboard.pins[pinNumber]);
            
        } else {
            reply("no board");
        }
            

    }
});

// =============== Routes for our API =======================
// Define GET route
server.route({
    method: 'GET',      // Methods Type
    path: '/api/pins',  // Url
    handler: function (request, reply) { //Action
        
        if (myboard && myboard.pins) { 
            reply({
                statusCode: 200,
                message: 'Getting All User Data',
                data: myboard.pins
            });
            
        } else {
            reply({
                statusCode: 400,
                message: 'No board',
                data: myboard.pins
            });        
        }
            

    }
});


function startServer(boardManager) {

    // =============== Start our Server =======================
    // Lets start the server
    server.start(function () {
        console.log('Server running at:', server.info.uri);
    });

    boardManager.newConnection.subscribe((d) => {
        myboard = d.board;
        console.log("BOARD CONNECTED");
    });

}

module.exports = {
    startServer: startServer,
    io: io
}
}());