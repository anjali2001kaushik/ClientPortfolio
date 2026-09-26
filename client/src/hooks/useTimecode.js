import { useEffect, useState } from 'react';

const pad = (n) => n.toString().padStart(2, '0');

/**
 * Runs a fake HH:MM:SS:FF film timecode counter at 24fps,
 * purely decorative — echoes the "everything is measured in
 * frames" theme of the DOP's world.
 */
export function useTimecode(fps = 24) {
  const [label, setLabel] = useState('00:00:00:00');

  useEffect(() => {
    let frame = 0;
    const interval = setInterval(() => {
      frame += 1;
      const ff = frame % fps;
      const ss = Math.floor(frame / fps) % 60;
      const mm = Math.floor(frame / fps / 60) % 60;
      const hh = Math.floor(frame / fps / 60 / 60);
      setLabel(`${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`);
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, [fps]);

  return label;
}
