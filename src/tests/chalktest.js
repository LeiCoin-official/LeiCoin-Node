const chalk = require('chalk');

//const mchalk = new c({level: 0});

function sendMinerLogMessage(message) {
    console.log(chalk.rgb(0, 255, 255).visible('[Miner] ') + chalk.reset(message));
    console.log(chalk.rgb(0, 255, 255).bold('[Miner] ') + chalk.reset(message));
    console.log(chalk.cyan.bold('[Miner] ') + chalk.reset(message));
};

function sendServerLogMessage(message) {

};
sendMinerLogMessage("hi");

// module.exports = {
//     sendMinerLogMessage,
//     sendServerLogMessage
// }