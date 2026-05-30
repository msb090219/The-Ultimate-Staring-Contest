import { CALIBRATION } from '../lib/constants/calibration.js';
import { MESSAGES } from '../lib/constants/messages.js';

export class CameraService {
  constructor() {
    this._stream = null;
    this.videoElement = null;
    this.isActive = false;
  }

  async initialize(videoElement) {
    this.videoElement = videoElement;

    try {
      this._stream = await navigator.mediaDevices.getUserMedia({
        video: CALIBRATION.video,
        audio: false
      });

      this.videoElement.srcObject = this._stream;
      await this.videoElement.play();

      this.isActive = true;
      return { success: true };
    } catch (error) {
      console.error('Camera access failed:', error);
      let message = MESSAGES.camera.failed;

      if (error.name === 'NotAllowedError') {
        message = MESSAGES.camera.denied;
      } else if (error.name === 'NotFoundError') {
        message = MESSAGES.camera.notFound;
      } else if (error.name === 'NotReadableError') {
        message = MESSAGES.camera.inUse;
      }

      return { success: false, error: message };
    }
  }

  get stream() {
    return this._stream;
  }

  updateVideoElement(videoElement) {
    this.videoElement = videoElement;
  }

  stop() {
    if (this._stream) {
      this._stream.getTracks().forEach(track => track.stop());
      this._stream = null;
    }
    this.isActive = false;
  }

  getVideoElement() {
    return this.videoElement;
  }

  getFrame() {
    if (!this.videoElement || !this.isActive) {
      return null;
    }
    return this.videoElement;
  }

  isActive() {
    return this.isActive;
  }

  async restart() {
    this.stop();
    if (this.videoElement) {
      return await this.initialize(this.videoElement);
    }
    return { success: false, error: MESSAGES.camera.failed };
  }
}

export const cameraService = new CameraService();
