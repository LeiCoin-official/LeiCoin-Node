import chalk from 'chalk';


function sendMinerLogMessage(message) {
    console.log(chalk.cyan('[Miner] ') + chalk.reset(message));
};

function sendServerLogMessage(message) {

};
sendMinerLogMessage("hi");

module.exports = {
    sendMinerLogMessage,
    sendServerLogMessage
}