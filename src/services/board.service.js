const rxjs = require("rxjs");



angular.module("AgentApp")
.service("BoardService", ["$rootScope", function($rootScope) {
    const server = require("./services/api.handlers.js");
    this.boardManager = require("./models/board.js");

    this.pinsSubject = new rxjs.Subject();
    this.pinsObs = this.pinsSubject.asObservable();

    this.pins=[]

    this.boardManager.newConnection.subscribe( d => {
        this.board = d.board;
        this.pins = this.board.pins;
    });
    
    this.boardManager.newData.subscribe(() => {
        this.pinsSubject.next(this.pins);
        //server.io.emit("data", this.pins)
    });


    this.boardManager.analogRead.subscribe((d,e) => {
        server.io.emit("analogRead", d,e)
    });

    this.boardManager.digitalRead.subscribe((d,e) => {
        server.io.emit("digitalRead", d,e)
    });




}])