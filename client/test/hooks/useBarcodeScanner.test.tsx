import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

const stopTrack = vi.fn();
const stopControls = vi.fn();
const getUserMedia = vi.fn();
let zxingCallback: ((result: { getText: () => string } | undefined) => void) | undefined;

vi.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: class {
    async decodeFromVideoElement(_video: unknown, cb: typeof zxingCallback) {
      zxingCallback = cb;
      return { stop: stopControls };
    }
  },
}));

const setMediaDevices = (value: unknown) =>
  Object.defineProperty(navigator, 'mediaDevices', { value, configurable: true });

const renderScanner = (onDetected = vi.fn()) => {
  const view = renderHook(() => useBarcodeScanner({ onDetected }));
  view.result.current.videoRef.current = document.createElement('video');
  return { ...view, onDetected };
};

beforeEach(() => {
  stopTrack.mockReset();
  stopControls.mockReset();
  getUserMedia.mockReset();
  zxingCallback = undefined;
  getUserMedia.mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] });
  setMediaDevices({ getUserMedia });
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  setMediaDevices(undefined);
});

test('reports unsupported without mediaDevices', async () => {
  setMediaDevices(undefined);
  const { result } = renderScanner();

  await act(async () => {
    await result.current.start();
  });

  expect(result.current.status).toBe('unsupported');
});

test('reports denied when permission is refused', async () => {
  getUserMedia.mockRejectedValue(new DOMException('no', 'NotAllowedError'));
  const { result } = renderScanner();

  await act(async () => {
    await result.current.start();
  });

  expect(result.current.status).toBe('denied');
  expect(result.current.error).toBe('Permite el acceso a la cámara o ingresa el código manualmente');
});

test('calls onDetected once with BarcodeDetector', async () => {
  vi.useFakeTimers();
  const detect = vi.fn().mockResolvedValue([{ rawValue: '7702001043276' }]);
  vi.stubGlobal(
    'BarcodeDetector',
    class {
      detect = detect;
    },
  );
  const { result, onDetected } = renderScanner();

  await act(async () => {
    await result.current.start();
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });

  expect(onDetected).toHaveBeenCalledTimes(1);
  expect(onDetected).toHaveBeenCalledWith('7702001043276');
});

test('falls back to zxing when BarcodeDetector is missing', async () => {
  const { result, onDetected } = renderScanner();

  await act(async () => {
    await result.current.start();
  });
  act(() => zxingCallback?.({ getText: () => '7702001043276' }));

  expect(onDetected).toHaveBeenCalledWith('7702001043276');
});

test('stops the camera track on unmount', async () => {
  const { result, unmount } = renderScanner();

  await act(async () => {
    await result.current.start();
  });
  unmount();

  expect(stopTrack).toHaveBeenCalled();
});

test('stop() releases the track and the zxing controls', async () => {
  const { result } = renderScanner();

  await act(async () => {
    await result.current.start();
  });
  act(() => result.current.stop());

  expect(stopTrack).toHaveBeenCalled();
  expect(stopControls).toHaveBeenCalled();
});
