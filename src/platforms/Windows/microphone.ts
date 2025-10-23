import fs from "fs";
import NodeMic from "node-mic";
import deasync from "deasync";

type MicrophoneOptions = {
  rate?: number;
  channels?: number;
  threshold?: number;
  endian?: "big" | "little";
  bitwidth?: number;
  encoding?: "signed-integer" | "unsigned-integer";
  device?: string;
  fileType?: "raw" | "wav";
  debug?: boolean;
};

interface MicrophoneStatus {
  recording: boolean;
  paused: boolean;
  stopped: boolean;
}

class Async {
  private static micInstance: any = null;
  private static micStream: any = null;
  private static status: MicrophoneStatus = {
    recording: false,
    paused: false,
    stopped: true,
  };

  static start(
    options?: MicrophoneOptions,
    outputFile: string = "output.raw"
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.micInstance = new NodeMic(options || {});
        this.micStream = this.micInstance.getAudioStream();
        const outputFileStream = fs.createWriteStream(outputFile);
        this.micStream.pipe(outputFileStream);

        this.micStream.on("data", (data: Buffer) => {
          // console.log("Audio data length:", data.length);
        });

        this.micStream.on("error", (err: Error) => {
          console.error("Error:", err.message);
        });

        this.micStream.on("started", () => {
          this.status.recording = true;
          this.status.paused = false;
          this.status.stopped = false;
        });

        this.micStream.on("paused", () => {
          this.status.paused = true;
          this.status.recording = false;
        });

        this.micStream.on("unpaused", () => {
          this.status.paused = false;
          this.status.recording = true;
        });

        this.micStream.on("stopped", () => {
          this.status.stopped = true;
          this.status.recording = false;
          this.status.paused = false;
        });

        this.micInstance.start();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  static pause(): void {
    if (this.micInstance) this.micInstance.pause();
  }

  static resume(): void {
    if (this.micInstance) this.micInstance.resume();
  }

  static stop(): void {
    if (this.micInstance) this.micInstance.stop();
  }

  static getStatus(): MicrophoneStatus {
    return this.status;
  }
}

class Sync {
  static start(
    options?: MicrophoneOptions,
    outputFile: string = "output.raw"
  ): void {
    let done = false;
    Async.start(options, outputFile)
      .then(() => (done = true))
      .catch((err) => {
        throw err;
      });
    deasync.loopWhile(() => !done);
  }

  static pause(): void {
    Async.pause();
  }

  static resume(): void {
    Async.resume();
  }

  static stop(): void {
    Async.stop();
  }

  static getStatus(): MicrophoneStatus {
    return Async.getStatus();
  }
}

export default class Microphone {
  public static readonly Async = Async;
  public static readonly Sync = Sync;
}
