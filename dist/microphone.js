import fs from "fs";
import NodeMic from "node-mic";
import deasync from "deasync";
class Async {
    static micInstance = null;
    static micStream = null;
    static status = {
        recording: false,
        paused: false,
        stopped: true,
    };
    static start(options, outputFile = "output.raw") {
        return new Promise((resolve, reject) => {
            try {
                this.micInstance = new NodeMic(options || {});
                this.micStream = this.micInstance.getAudioStream();
                const outputFileStream = fs.createWriteStream(outputFile);
                this.micStream.pipe(outputFileStream);
                this.micStream.on("data", (data) => {
                    // console.log("Audio data length:", data.length);
                });
                this.micStream.on("error", (err) => {
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
            }
            catch (err) {
                reject(err);
            }
        });
    }
    static pause() {
        if (this.micInstance)
            this.micInstance.pause();
    }
    static resume() {
        if (this.micInstance)
            this.micInstance.resume();
    }
    static stop() {
        if (this.micInstance)
            this.micInstance.stop();
    }
    static getStatus() {
        return this.status;
    }
}
class Sync {
    static start(options, outputFile = "output.raw") {
        let done = false;
        Async.start(options, outputFile)
            .then(() => (done = true))
            .catch((err) => {
            throw err;
        });
        deasync.loopWhile(() => !done);
    }
    static pause() {
        Async.pause();
    }
    static resume() {
        Async.resume();
    }
    static stop() {
        Async.stop();
    }
    static getStatus() {
        return Async.getStatus();
    }
}
export default class Microphone {
    static Async = Async;
    static Sync = Sync;
}
//# sourceMappingURL=microphone.js.map