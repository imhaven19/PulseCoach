/**
 * Audio utility functions for voice coach features
 */

/**
 * Convert base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Convert Uint8Array to base64 string
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Create a PCM audio blob from raw audio data
 */
export function createPcmBlob(
  audioData: Float32Array | Int16Array,
  sampleRate: number = 16000,
  numChannels: number = 1
): Blob {
  // Convert Float32Array to Int16Array if needed
  let int16Data: Int16Array;
  if (audioData instanceof Float32Array) {
    int16Data = new Int16Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      const s = Math.max(-1, Math.min(1, audioData[i]));
      int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
  } else {
    int16Data = audioData;
  }

  // Create WAV header
  const wavHeader = createWavHeader(int16Data.length * 2, sampleRate, numChannels);
  
  // Combine header and data
  const wavBlob = new Blob([wavHeader, int16Data], { type: 'audio/wav' });
  return wavBlob;
}

/**
 * Create a WAV file header
 */
function createWavHeader(
  dataLength: number,
  sampleRate: number,
  numChannels: number
): ArrayBuffer {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);

  // "RIFF" chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  return header;
}

/**
 * Write a string to a DataView
 */
function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Decode audio data from various formats
 */
export async function decodeAudioData(
  audioContext: AudioContext,
  audioData: ArrayBuffer | Uint8Array
): Promise<AudioBuffer> {
  const buffer = audioData instanceof Uint8Array ? audioData.buffer : audioData;
  
  try {
    const audioBuffer = await audioContext.decodeAudioData(buffer.slice(0));
    return audioBuffer;
  } catch (error) {
    console.error('Failed to decode audio data:', error);
    throw new Error('Unable to decode audio data');
  }
}

/**
 * Resample audio buffer to target sample rate
 */
export function resampleAudio(
  audioBuffer: AudioBuffer,
  targetSampleRate: number
): Float32Array {
  const sourceRate = audioBuffer.sampleRate;
  const sourceData = audioBuffer.getChannelData(0);
  
  if (sourceRate === targetSampleRate) {
    return sourceData;
  }

  const ratio = sourceRate / targetSampleRate;
  const newLength = Math.round(sourceData.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const sourceIndex = i * ratio;
    const lowerIndex = Math.floor(sourceIndex);
    const upperIndex = Math.min(lowerIndex + 1, sourceData.length - 1);
    const fraction = sourceIndex - lowerIndex;
    
    result[i] = sourceData[lowerIndex] * (1 - fraction) + sourceData[upperIndex] * fraction;
  }

  return result;
}

/**
 * Convert AudioBuffer to Int16Array for transmission
 */
export function audioBufferToInt16(audioBuffer: AudioBuffer): Int16Array {
  const channelData = audioBuffer.getChannelData(0);
  const int16Data = new Int16Array(channelData.length);
  
  for (let i = 0; i < channelData.length; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  
  return int16Data;
}
