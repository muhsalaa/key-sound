import { KeyTypes } from './types';

interface KeySoundConfig {
  parallelPlayback: boolean;
}

export class KeySound {
  private bindings: {
    key: KeyTypes;
    src: string;
    audioBuffer?: AudioBuffer;
    audio?: HTMLAudioElement;
    callback?: () => void;
  }[] = [];
  private audioContext: AudioContext | undefined;
  private config: KeySoundConfig = { parallelPlayback: false };
  private paused: boolean = false;

  constructor() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private getExistingBinding(key: KeyTypes):
    | {
        key: KeyTypes;
        src: string;
        audioBuffer?: AudioBuffer;
        audio?: HTMLAudioElement;
      }
    | undefined {
    return this.bindings.find((binding) => binding.key === key);
  }

  /**
   * Handles the keydown event and plays the corresponding sound if a binding exists.
   *
   * @param {KeyboardEvent} event - The keydown event object.
   * @return {Promise<void>} A promise that resolves when the sound has finished playing.
   */
  private async handleKeyDown(event: KeyboardEvent) {
    if (this.paused) return;

    const binding = this.bindings.find(
      (binding) => binding.key.toLowerCase() === event.key.toLowerCase()
    );

    if (binding) {
      binding.callback?.();
      // Create or resume AudioContext on user gesture because some browsers require it like chrome
      // that wont play the audio without it
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.playSound(binding);
    }
  }

  /**
   * Plays a sound based on the provided binding.
   *
   * @param {Object} binding - The binding object containing the key, source, and optional audio buffer or audio element.
   * @param {string} binding.key - The key associated with the sound.
   * @param {string} binding.src - The source of the sound file.
   * @param {AudioBuffer} [binding.audioBuffer] - Optional audio buffer for parallel playback.
   * @param {HTMLAudioElement} [binding.audio] - Optional audio element for sequential playback.
   * @return {void} This function does not return anything.
   */
  private playSound(binding: {
    key: string;
    src: string;
    audioBuffer?: AudioBuffer;
    audio?: HTMLAudioElement;
  }) {
    if (this.config.parallelPlayback) {
      if (binding.audioBuffer) {
        this.createAndPlayBufferSource(binding.audioBuffer);
      } else {
        fetch(binding.src)
          .then((response) => response.arrayBuffer())
          .then((buffer) => this.audioContext!.decodeAudioData(buffer))
          .then((decodedData) => {
            binding.audioBuffer = decodedData;
            this.createAndPlayBufferSource(decodedData);
          })
          .catch((error) =>
            console.error(`Error decoding audio data: ${error}`)
          );
      }
    } else {
      if (binding.audio) {
        binding.audio.currentTime = 0;
        binding.audio.play();
      } else {
        binding.audio = new Audio(binding.src);
        binding.audio.play();
      }
    }
  }

  private createAndPlayBufferSource(audioBuffer: AudioBuffer) {
    const bufferSource = this.audioContext!.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.connect(this.audioContext!.destination);
    bufferSource.start(0);
  }

  /**
   * Binds a key-source pair or an array of key-source pairs to the object.
   * If an array is provided, each object in the array is added to the bindings.
   * If a single object is provided, it is added to the bindings.
   * If a binding already exists for a given key, it is not added again.
   *
   * @param {Array<{ key: KeyTypes; src: string }> | { key: KeyTypes; src: string }} binding - The key-source pair or array of key-source pairs to bind.
   */
  public bind(
    binding: { key: KeyTypes; src: string }[] | { key: KeyTypes; src: string }
  ) {
    if (Array.isArray(binding)) {
      // If an array is provided, add each object in the array to the bindings.
      binding.forEach((item) => {
        const existingBinding = this.getExistingBinding(item.key);
        if (!existingBinding) {
          this.bindings.push({ ...item, audioBuffer: undefined });
        }
      });
    } else {
      // If a single object is provided, add it to the bindings.
      const existingBinding = this.getExistingBinding(binding.key);
      if (!existingBinding) {
        this.bindings.push({ ...binding, audioBuffer: undefined });
      }
    }
  }

  /**
   * Removes a binding for the given key from the list of bindings.
   *
   * @param {KeyTypes} key - The key to unbind.
   * @return {void} This function does not return anything.
   */
  public unbind(keys: KeyTypes | KeyTypes[]) {
    const keysToUnbind = Array.isArray(keys) ? keys : [keys];
    this.bindings = this.bindings.filter((binding) =>
      keysToUnbind.every((key) => binding.key !== key)
    );
  }

  /**
   * Sets the config object.
   *
   * @param {KeySoundConfig} config - The new config object.
   */
  public setConfiguration(config: KeySoundConfig) {
    this.config = { ...this.config, ...config };
  }

  public pause() {
    this.paused = true;
  }

  public resume() {
    this.paused = false;
  }
}
