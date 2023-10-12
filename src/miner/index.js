

const { Worker } = require('worker_threads');

if (isMainThread) {
  // This is the main thread
  const worker = new Worker('worker.js', { workerData: { /* data to pass to the worker */ } });

  // Listen for messages from the worker
  worker.on('message', (message) => {
    console.log('Received message from worker:', message);
  });

  // Send data to the worker
  worker.postMessage('Hello from the main thread');
}
