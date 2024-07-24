let GraceyInstance: Gracey;

async function wait(t: number) {
  return new Promise((r) => {
    setTimeout(r, t || 1000);
  });
}

export class Gracey {
  private tasks: number;

  private isShutdown = false;

  private instanceOfWorker: number;

  constructor() {
    this.tasks = 0;
    this.instanceOfWorker = process.pid;
  }

  /** Get the process id of the worker that is using this instance of Gracey */
  public instancePid(): number {
    return this.instanceOfWorker;
  }

  /** Get the amount of tasks currently tracked by this Gracey */
  public getTasksAmount(): number {
    return this.tasks;
  }

  /** Add a task.
   * @param {Number} amount The amount of tasks to add. Default: 1
   */
  public addTask(amount: number = 1): void {
    if (this.isShutdown) return;

    this.tasks += amount;
  }

  /** Done task.
   * @param amount The amount of tasks to remove. Default: 1
   * @returns
   */
  public doneTask(amount: number = 1): void {
    if (amount == -1) {
      this.tasks = 0;
      return;
    }

    this.tasks -= amount;
  }

  /**
   * "terminate" function, meant to use with await so that it blocks shutdown until all tasks are completed
   * @param timeout The timeout in milliseconds before the shutdown is forced. Default: 30000
   * Example:
   * ```js
   * process.on('SIGTERM', async () => {
   * await Gracey.terminate();
   * process.exit(0);
   * });
   * ```
   */
  public async terminate(timeout?: number): Promise<void> {
    return new Promise(async (resolve) => {
      console.log(
        "Terminating Gracey, tasks running:",
        this.tasks,
        process.pid
      );

      this.isShutdown = true;

      if (this.tasks === 0) {
        resolve();
      }

      setTimeout(() => {
        console.log(
          "Graceful shutdown timeout, tasks still running:",
          this.tasks
        );
        resolve();
      }, timeout || 60000);

      while (this.tasks > 0) {
        await wait(500);
      }

      resolve();
    });
  }
}

export function getGracey(): Gracey {
  if (!GraceyInstance) {
    GraceyInstance = new Gracey();
  }

  return GraceyInstance;
}
