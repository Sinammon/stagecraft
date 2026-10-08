import sound from '@phosphor-icons/core/assets/bold/waveform-bold.svg?raw';
import mic from '@phosphor-icons/core/assets/bold/microphone-bold.svg?raw';
import video from '@phosphor-icons/core/assets/bold/video-camera-bold.svg?raw';
import chat from '@phosphor-icons/core/assets/bold/chat-circle-bold.svg?raw';
import shield from '@phosphor-icons/core/assets/bold/shield-check-bold.svg?raw';
import check from '@phosphor-icons/core/assets/bold/check-bold.svg?raw';
import clock from '@phosphor-icons/core/assets/bold/clock-bold.svg?raw';
import spark from '@phosphor-icons/core/assets/bold/sparkle-bold.svg?raw';
import edit from '@phosphor-icons/core/assets/bold/pencil-simple-line-bold.svg?raw';
import stop from '@phosphor-icons/core/assets/bold/square-bold.svg?raw';
import reset from '@phosphor-icons/core/assets/bold/arrow-counter-clockwise-bold.svg?raw';
import external from '@phosphor-icons/core/assets/bold/arrow-up-right-bold.svg?raw';
import arrow from '@phosphor-icons/core/assets/bold/arrow-right-bold.svg?raw';
import headphones from '@phosphor-icons/core/assets/bold/headphones-bold.svg?raw';
import scan from '@phosphor-icons/core/assets/bold/scan-bold.svg?raw';
import eye from '@phosphor-icons/core/assets/bold/eye-bold.svg?raw';
import down from '@phosphor-icons/core/assets/bold/caret-down-bold.svg?raw';

const icons = {
  sound,
  mic,
  video,
  chat,
  shield,
  check,
  clock,
  spark,
  edit,
  stop,
  reset,
  external,
  arrow,
  headphones,
  scan,
  eye,
  down,
};
const cache = new Map();
export function icon(name) {
  if (!cache.has(name)) {
    // Only trusted, bundled SVG assets enter the UI; dynamic content is escaped separately.
    cache.set(
      name,
      (icons[name] || spark).replace(
        '<svg ',
        '<svg class="ui-icon" aria-hidden="true" focusable="false" ',
      ),
    );
  }
  return cache.get(name);
}
