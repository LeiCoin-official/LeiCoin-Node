import { UTCDate } from '@date-fns/utc/date';
import { CronJob } from 'cron';
import cron from 'node-cron';

function calulateAccuracy() {
    const actualTime = new UTCDate();
    const expectedTime = new UTCDate(actualTime);
    expectedTime.setMilliseconds(0);

    const millisecondsOffset = actualTime.getMilliseconds() - expectedTime.getMilliseconds();
    return millisecondsOffset;
}

function testNodeCron(): Promise<number[]> {
    return new Promise((resolve, reject) => {
        const results: number[] = [];

        let count = 0;
        const schedule = cron.schedule('4,9,14,19,24,29,34,39,44,49,54,59 * * * * *', () => {
            results.push(calulateAccuracy());
            if (count >= 12 - 1) {
                schedule.stop();
                return resolve(results);
            }
            count++;
        });
    });
}

async function testNewCron(): Promise<number[]> {
    return new Promise((resolve, reject) => {
        const results: number[] = [];
        let count = 0;

        const schedule = new CronJob('4,9,14,19,24,29,34,39,44,49,54,59 * * * * *', () => {
            results.push(calulateAccuracy());
            if (count >= 12 - 1) {
                schedule.stop();
                return resolve(results);
            }
            count++;
        }, null, true);
    });
} 

async function calulateAverageOffset(results: number[]) {
    const totalOffset = results.reduce((acc, offset) => acc + offset, 0);
    return totalOffset / results.length;
}

async function main() {
    const nodeCronResults = await testNodeCron();
    console.log(`Node-Cron average time offset: ${await calulateAverageOffset(nodeCronResults)}ms`);

    const newCronResults = await testNewCron();
    console.log(`New-Cron average time offset: ${await calulateAverageOffset(newCronResults)}ms`);

    process.exit(0);
}


await main();