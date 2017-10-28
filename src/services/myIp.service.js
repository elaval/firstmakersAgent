angular.module("AgentApp")
.service("MyIpService", ["$rootScope", function($rootScope) {
    const ip = require("ip");
    
    this.address = ip.address;
}]);
