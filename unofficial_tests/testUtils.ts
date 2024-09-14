export function startTimer() {
    return performance.now();
}

export function endTimer(startTime: number) {
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;
    return elapsedTime; // Return the elapsed time in milliseconds
}