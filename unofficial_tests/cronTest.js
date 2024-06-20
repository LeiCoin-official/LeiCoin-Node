import cron from "node-cron";

function getCurrentSlot() {
    const GENESIS_TIME = 1718841600;
    console.log(Date.now() / 1000)
    console.log(Math.floor(
        (Math.floor(Date.now() / 1000) - GENESIS_TIME) / 15
    ));
}

function startCronJob() {
    const task = cron.schedule('0,15,30,45 * * * * *', () => {
      	console.log(`Task executed at: ${new Date().toISOString()}`);
        getCurrentSlot();
    });
  
    task.start();
    console.log('Cron job started, will run every 15 seconds.');
}


//startCronJob();

console.log(Math.floor(
    (Math.floor(1718841615.9999) - 1718841600) / 15
));
