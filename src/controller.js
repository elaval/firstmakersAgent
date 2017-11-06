angular.module('AgentApp', ['ngMaterial','btford.socket-io'])
.service('socketService', function (socketFactory) {
    this.rootSocket = function() {
        var myIoSocket = io.connect('http://localhost:19675/');
        
        const rootSocket = socketFactory({
            ioSocket: myIoSocket
        });

        return rootSocket
    }

    this.nameSpaceSocket = function(boardName) {
        // Prepend a / unless it already begins with /
        const nameSpace = boardName.charAt(0) === '/'
            ? boardName
            : `/${boardName}`;

        const myIoSocket = io.connect('http://localhost:19675'+nameSpace);
        const socket = socketFactory({
            ioSocket: myIoSocket
        })
        socket.forward('error');

        return socket;
    }
})
.controller('MainController', [
    "BoardService", 
    "$scope", 
    "MyIpService",
    "socketService",
    "$interval",
    function(boardService, $scope, myIpService, socketService, $interval) {
    var self = this;

    // Object that will store data associated to each published board
    this.boards = {};

    const rootSocket = socketService.rootSocket();

    rootSocket.on('board', boardName => {
        var boardSocket = socketService.nameSpaceSocket(`${boardName}`);

        console.log(`PORT CONNECTED ON THE CLIENT: ${boardName}`);
        this.boards[boardName] = {
            pins: [],
            analogPins: [],
            socket: boardSocket
        }

        boardSocket.on('pins', pins => {
            $scope.$apply(() => {
                this.setPins(this.boards[boardName], pins)
            })   
        })

        boardSocket.on('analogPins', d => {
            $scope.$apply(() => {
                this.boards[boardName].analogPins = d;
            })   
        })

        boardSocket.on('state', state => {
            $scope.$apply(() => {
                this.boards[boardName].currentState = state;
                console.log("STATE", boardName, state, this.boards[boardName].currentState)
            })   
        })

        boardSocket.on('analogRead', d => {
            $scope.$apply(() => {
                this.boards[boardName].pins[d.pin].value = d.value;
            })  
            // console.log(`AnalogRead ${portName} pin ${d.pin}: ${d.value}`);
        })

        boardSocket.on('digitalRead', d => {
            $scope.$apply(() => {
                this.boards[boardName].pins[d.pin].value = d.value;
            })  
        })

        boardSocket.on('pinMode', d => {
            $scope.$apply(() => {
                this.boards[boardName].pins[d.pin] = this.boards[boardName].pins[d.pin] || {};
                this.boards[boardName].pins[d.pin].mode = d.mode;
            })  
        })

    });

    this.state = "not connected"
    this.address = myIpService.address();

 

    // Sends a message to the agent to change a pin´s value
    this.setPinValue = function(boardName, pinNumber, value) {
        const boardSocket = this.boards[boardName].socket;

        if (boardSocket) {
            boardSocket.emit('pinValue', {pin: pinNumber, value:value});
        }
    }

    this.restartApp = function() {
        chrome.runtime.reload();
    }

    this.modeDescription = (mode) => {
        return boardService.getPinModeDesc(mode);
    }

    this.setPins = (board, pins) => {
        board.pins = pins;
        /*
        _.each(pins, (pin, i) => {
            board.pins[i] = pin;
        })
        */
    }

    this.dataType = (pin) => {
        let type='number';
        if (pin && (pin.mode === 0 || pin.mode === 1)) {
            type = 'binary'
        }

        return type;
    }

    this.pinLabel = (board, pinNumber) => {
        let pinLabel = `${pinNumber}`;

        // Chekc if this is an analog pin
        if (board.analogPins && board.analogPins.indexOf(pinNumber) >= 0 ) {
            pinLabel = `A${board.analogPins.indexOf(pinNumber)}`
        } 

        return pinLabel;
    }
    

    $scope.$on('socket:error', function (ev, data) {
        console.error(ev,data)
    });
}]);

