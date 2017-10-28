//var exports = module.exports = {};
const serialport = require("browser-serialport");
const rxjs = require("rxjs");

const rport = /usb|DevB|acm|^com/i;  // Regexp used to identify valid ports for arduinos
const pollInterval = 10000;

var SerialServiceModule = {
};
module.exports = SerialServiceModule;

console.log("SerialService")
class SerialService {
    constructor() {
        this.existingPorts = {}; // Marks existing ports
        this.subject = new rxjs.Subject();
        this.ports = this.subject.asObservable();

        window.setInterval(() => {
            this.listPorts()
            .then( ports => {
                const newPorts = this.getNewPorts(ports);
                this.saveExistingPortsPorts(ports);

                if (newPorts && newPorts.length) {
                    this.subject.next(newPorts);
                }

            });
        }, 1000);
    }

    serialPoll() {
        return this.subject.asObservable();
    }
    
    listPorts() {
        const resolver = (resolve,reject) => {
            serialport.list((err,result) => {

                var ports = result.filter((val) => {
                    var available = true;
                    
                    if (!rport.test(val.comName)) {
                        available = false;
                    }
        
                    return available;
                })
                .map( d => d.comName)
        
                resolve(ports);
            })
        }

        return new Promise(resolver)
    }

    getNewPorts(ports) {
        const newPorts = ports.filter((d) => {
            return !this.existingPorts[d];
        });

        return newPorts;
    }

    saveExistingPortsPorts(ports) {
        this.existingPorts = {};
        ports.forEach(d => this.existingPorts[d] = true);
    }

}


module.exports = new SerialService();