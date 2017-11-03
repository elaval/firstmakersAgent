const rxjs = require("rxjs");



angular.module("AgentApp")
.service("BoardService", ["$rootScope", function($rootScope) {
    const PIN_MODES = {
        0 : 'INPUT',
        1 : 'OUTPUT',
        2 : 'ANALOG',
        3 : 'PWM',
        4 : 'SERVO',
        5 : 'SHIFT',
        6 : 'I2C',
        7 : 'ONEWIRE',
        8 : 'STEPPER',
        10 : 'SERIAL',
        11 : 'PULLUP',
        127 : 'IGNORE',
        16 : 'UNKOWN'
    }

    this.getPinModeDesc = function (mode) {
        return PIN_MODES[mode];
    } 

}])