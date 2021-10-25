import { fork } from 'child_process'

const controller = new AbortController();
const { signal } = controller

const child = fork(__filename, ['child'], { signal })

child.on('error', (err) => {
  // This will be called with err being an AbortError if the controller aborts
});
// controller.abort(); // Stops the child process