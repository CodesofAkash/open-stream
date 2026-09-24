/**
 * One audio track out, however many in.
 *
 * Publishing the microphone and the shared tab's audio as separate LiveKit
 * tracks looked right and did not work: the player attaches every audio track
 * to one element, a browser will not reliably play the second one, and the
 * streamer had no way to balance them. Viewers heard the mic and nothing else.
 *
 * So the inputs are mixed here instead, through a Web Audio graph, and the
 * result is published as a single track. Each input keeps its own gain, which
 * is what makes a mixer with per-source faders possible at all, and an
 * analyser so the UI can show a level rather than a number nobody can judge.
 *
 * An AudioContext starts suspended until a user gesture, so `resume` is called
 * from the click that starts a capture.
 */

interface MixerChannelState {
  id: string;
  label: string;
  volume: number;
  muted: boolean;
}

interface MixerChannel extends MixerChannelState {
  stream: MediaStream;
  source: MediaStreamAudioSourceNode;
  gain: GainNode;
  analyser: AnalyserNode;
  samples: Float32Array<ArrayBuffer>;
}

class AudioMixer {
  private context: AudioContext;
  private destination: MediaStreamAudioDestinationNode;
  private master: DynamicsCompressorNode;
  private channels = new Map<string, MixerChannel>();

  constructor() {
    // Left to the hardware: forcing 48kHz resamples every device that does
    // not run at it, and that resampling is heard as crackling.
    this.context = new AudioContext();
    this.destination = this.context.createMediaStreamDestination();

    // Two sources at full scale sum past what a sample can hold and the
    // overflow clips, which is the other thing crackling turns out to be.
    this.master = this.context.createDynamicsCompressor();
    this.master.threshold.value = -3;
    this.master.knee.value = 0;
    this.master.ratio.value = 20;
    this.master.attack.value = 0.003;
    this.master.release.value = 0.25;
    this.master.connect(this.destination);
  }

  /** The mixed result, ready to publish. */
  get outputStream(): MediaStream {
    return this.destination.stream;
  }

  get states(): MixerChannelState[] {
    return [...this.channels.values()].map(({ id, label, volume, muted }) => ({
      id,
      label,
      volume,
      muted,
    }));
  }

  async resume() {
    if (this.context.state === "suspended") await this.context.resume();
  }

  /** Add a capture's audio. A capture with no audio track is simply ignored. */
  add(id: string, label: string, stream: MediaStream, volume = 1) {
    if (stream.getAudioTracks().length === 0) return;
    this.remove(id);

    const source = this.context.createMediaStreamSource(stream);
    const gain = this.context.createGain();
    const analyser = this.context.createAnalyser();
    analyser.fftSize = 512;

    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(analyser);
    gain.connect(this.master);

    this.channels.set(id, {
      id,
      label,
      volume,
      muted: false,
      stream,
      source,
      gain,
      analyser,
      samples: new Float32Array(analyser.fftSize),
    });
  }

  remove(id: string) {
    const channel = this.channels.get(id);
    if (!channel) return;

    channel.source.disconnect();
    channel.gain.disconnect();
    channel.analyser.disconnect();
    this.channels.delete(id);
  }

  setVolume(id: string, volume: number) {
    const channel = this.channels.get(id);
    if (!channel) return;

    channel.volume = volume;
    channel.gain.gain.value = channel.muted ? 0 : volume;
  }

  setMuted(id: string, muted: boolean) {
    const channel = this.channels.get(id);
    if (!channel) return;

    channel.muted = muted;
    channel.gain.gain.value = muted ? 0 : channel.volume;
  }

  /** Current loudness per channel, 0–1, as RMS of the last analyser window. */
  levels(): Record<string, number> {
    const levels: Record<string, number> = {};

    for (const channel of this.channels.values()) {
      channel.analyser.getFloatTimeDomainData(channel.samples);

      let sum = 0;
      for (const sample of channel.samples) sum += sample * sample;

      levels[channel.id] = Math.min(1, Math.sqrt(sum / channel.samples.length) * 3);
    }

    return levels;
  }

  close() {
    for (const id of [...this.channels.keys()]) this.remove(id);
    void this.context.close();
  }
}

export default AudioMixer;
export type { MixerChannelState };
