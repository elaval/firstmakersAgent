angular.module('AgentApp', [])
.controller('MainController', [
    "BoardService", 
    "$scope", 
    "MyIpService",
    function(BoardService, $scope, myIpService) {
    var self = this;

    this.state = "not connected"
    this.address = myIpService.address();

    BoardService.pinsObs.subscribe(pins => {
        $scope.$apply(() => {
            this.pins = pins;
        })
        
    })


    this.boardManager = BoardService.boardManager;
    this.boardManager.state
    .subscribe(d => $scope.$apply(() => this.state = d));

    self.name = "Ernesto";
    
}]);

