const Firmata = require('firmata');
const rxjs = require("rxjs");
const serialService = require("./serial.js");
const _ = require('lodash');


class BoardManager {
    constructor() {
        this.newConnectionSubject = new rxjs.Subject();
        this.newConnection = this.newConnectionSubject.asObservable();
        
        this.newDataSubject = new rxjs.Subject();
        this.newData = this.newDataSubject.asObservable();

        this.analogReadSubject = new rxjs.Subject();
        this.analogRead = this.analogReadSubject.asObservable();

        this.digitalReadSubject = new rxjs.Subject();
        this.digitalRead = this.digitalReadSubject.asObservable();

        this.stateSubject = new rxjs.Subject();
        this.state = this.stateSubject.asObservable();

        this.previousValues = {};  // Store the previous value of a pin to detect changes

        this.connecting = false;
        this.connected = false;
        this.board = undefined;

        this.arduino = {
            board : undefined,	// Reference to arduino board - to be created by new firmata.Board()
            connecting : false,	// Flag to avoid multiple attempts to connect
            disconnecting : false,  // Flag to avoid serialport communication when it is being closed
            justConnected: false,	// Flag to avoid double attempts
            keepAliveIntervalID: null,
            connected: false
        }

    }

    /**
     * Initiates a port connection
     * 
     * @param {any} port 
     * @memberof BoardManager
     */
    connect(port) {

        this.stateSubject.next("connecting");
        
        // create a new firmata board on the given port
        this.board = new Firmata(port, (err) => {
            // Clear timeout to avoid problems if connection is closed before timeout is completed
            clearTimeout(this.connectionTimeout); 
                
            if (err) {
                this.disconnect(true);
                
            } else {
              
                this.stateSubject.next("connected");
                
                console.log("Connected to board");

                this.board.sp.on('disconnect', this.disconnectHandler.bind(this));
                this.board.sp.on('close', this.closeHandler.bind(this));
                this.board.sp.on('error', this.errorHandler.bind(this));
                this.reportAnalogPins();
                this.newConnectionSubject.next(this);
            }
        })

        // Set timeout to check if device does not speak firmata (in such case new Board callback was never called, but board object exists) 
        this.connectionTimeout = setTimeout(function() {
        // If !board.versionReceived, the board has not established a firmata connection
        if (this.board && !this.board.versionReceived) {
            var port = this.board.sp.path;


            // silently closing the connection attempt
            this.disconnect(true); 
            this.stateSubject.next("wrong connection (firmata loaded?)");

        } else {
            this.stateSubject.next("wrong connection (firmata loaded?)");
        }

        }, 15000);

  
    }

    disconnect(silent) {
        //arduino.board.serialClose(arduino.board.sp.path);///
        if (this.isBoardReady()) {
            // Prevent disconnection attempts before board is actually connected
            this.connected = false;
            this.disconnecting = true;
            this.board.sp.close();
            this.closeHandler(silent);
        } else if (!this.board) {
            // Don't send info message if the board has been connected
            if (!silent) {
                alert('Board is not connected');
            }
        } 
    }

    isBoardReady() {
        return ((this.board !== undefined) 
                && (this.board.pins.length>0) 
                && (!this.disconnecting));
    };
  
    pinMode(pinNumber, mode) {
        const pin = this.board.pins[pinNumber];
        // Check if mode is supported by the pin
        const index = _.findIndex(pin.supportedModes, d => d === mode);
        if ( index > -1) {
            this.board.pinMode(pinNumber,mode);
            this.board.digitalRead(pinNumber, (d) => {
                if (d !== this.previousValues[pinNumber]) {
                    this.newDataSubject.next(this.board.pins);                                        
                    this.digitalReadSubject.next({pin:pinNumber, value:d});
                }
                this.previousValues[pinNumber] = d;
            });
        };
    }

    /**
     * Initiates an AnalogRead on each analog pin in order to update their values
     * 
     * @memberof BoardManager
     */
    reportAnalogPins() {
        this.board.analogPins.forEach((element,analogPinNumber) => {
            this.board.analogRead(analogPinNumber, (d) => {
                const pinNumber = this.board.analogPins[analogPinNumber]

                if (d !== this.previousValues[pinNumber]) {
                    this.newDataSubject.next(this.board.pins);                    
                    this.analogReadSubject.next({pin:analogPinNumber, value:d});
                }
                this.previousValues[pinNumber] = d;
            });
        });
    }

    disconnectHandler() {
        console.log("disconnected")
        this.stateSubject.next("disconnected");
    }

    closeHandler() {
        var portName =  "unknown";
        
        if (this.board) {
            portName = this.board.sp.path;
            
            this.board.sp.removeListener('disconnect', this.disconnectHandler);
            this.board.sp.removeListener('close', this.closeHandler);
            this.board.sp.removeListener('error', this.errorHandler);
            this.board = undefined;
        };

        this.stateSubject.next("disconnected");
        
        

        $rootScope.$broadcast("board.closed", {'port':portName, 'disconnected':arduino.disconnected, 'silent':silent});
        arduino.disconnected = false;
    }

    errorHandler() {

    }

}



const boardManager = new BoardManager(); // board.js

serialService.ports
.subscribe(d => {
    console.log(d)
    boardManager.connect(d[0]);
});

module.exports = boardManager;

