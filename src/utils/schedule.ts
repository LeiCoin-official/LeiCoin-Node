
export class Schedule {

    private timeout: Timer;
    private finished = false;

    constructor(task: () => void, ms: number) {
        this.timeout = setTimeout(() => {
            this.cancel();
            task();
        }, ms);
    }

    public cancel() {
        clearTimeout(this.timeout);
        this.finished = true;
    }

    public hasFinished() {
        return this.finished;
    }

}

export default Schedule;
