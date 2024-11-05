export function startTimer() {
    return performance.now();
}

export function endTimer(startTime: number) {
    const endTime = performance.now();
    return endTime - startTime; // Return the elapsed time in milliseconds
}