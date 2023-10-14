const process = require('process');
const chalk = require('chalk');

const processRootDirectory = process.cwd();
const mining_difficulty = 6;

function generateLogMessage(prefix, message, style = 'reset') {
    const styles = {
      reset: chalk.reset,
      green: chalk.green,
      red: chalk.red,
      blue: chalk.blue,
    };
  
    if (styles[style]) {
      return `${chalk[prefix](`[${prefix}]`)} ${styles[style](message)}`;
    } else {
      return `${chalk[prefix](`[${prefix}]`)} ${chalk.reset(message)}`;
    }
  }
  
  const messageTypes = ['log', 'success', 'error'];
  
  // Define mappings of prefixes and colors
  const messageConfigs = [
    { object: miner_message, prefix: 'Miner', color: 'cyan' },
    { object: server_message, prefix: 'Server', color: 'magenta' },
    { object: data_message, prefix: 'Data', color: 'blue' },
  ];
  
  // Create objects for miner, server, and data messages using a loop
  for (const type of messageTypes) {
    for (const { object, prefix, color } of messageConfigs) {
      object[type] = (message) => {
        console.log(generateLogMessage(color, message, type === 'log' ? 'reset' : type));
      };
    }
  }

module.exports = {
    processRootDirectory,
    mining_difficulty,
    miner_message,
    server_message,
    data_message
}