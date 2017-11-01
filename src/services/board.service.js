const rxjs = require("rxjs");



angular.module("AgentApp")
.service("BoardService", ["$rootScope", function($rootScope) {
    const server = require("./my_node_modules/server.js");
    this.communicationsController = require("./my_node_modules/communicationController.js");

    this.pinsSubject = new rxjs.Subject();
    this.pinsObs = this.pinsSubject.asObservable();

    this.boardsSubject = new rxjs.Subject();
    this.boardsObservable = this.boardsSubject.asObservable();

    this.boardSubject = new rxjs.Subject();
    this.boardObservable = this.boardSubject.asObservable();    
    
    this.updateSubject = new rxjs.Subject();
    this.update = this.updateSubject.asObservable();

    this.communicationsController.boardObservable.subscribe((board) => {
        this.boardSubject.next(board);

        board.update.subscribe(() => {
            this.updateSubject.next();
        })
    });

    this.communicationsController.boardsObservable.subscribe((boards) => {

        this.boardsSubject.next(boards);
    
        /*
        this.board.newData.subscribe(() => {
            this.pinsSubject.next(this.pins);
            //server.io.emit("data", this.pins)
        });
    
    
        this.board.analogRead.subscribe((d,e) => {
            server.io.emit("analogRead", d,e)
        });
    
        this.board.digitalRead.subscribe((d,e) => {
            server.io.emit("digitalRead", d,e)
        });
        */
    })

    





}])