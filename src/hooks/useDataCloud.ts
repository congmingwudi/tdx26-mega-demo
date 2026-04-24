/**
 * Data Cloud Web SDK integration for tracking presentation engagement.
 *
 * Captures: slide views, play/pause, mute/unmute, voice changes,
 * slide jumps, link clicks, and presentation completion.
 *
 * The SDK script is loaded via CDN in index.html. The CDN URL is
 * unique per Data Cloud Website Connector — replace the placeholder
 * in index.html with the URL from your connector's Integration Guide.
 */

import { useEffect, useRef } from 'react';
import { SLIDE_LABELS } from '../data/slides';

declare global {
  interface Window {
    SalesforceInteractions?: {
      sendEvent: (payload: any) => void;
      init: (config: any) => Promise<void>;
      ConsentPurpose: { Tracking: string };
      ConsentStatus: { OptIn: string; OptOut: string };
    };
  }
}

function getSdk() {
  return window.SalesforceInteractions;
}

function sendEvent(name: string, attributes: Record<string, any> = {}) {
  const sdk = getSdk();
  if (!sdk) return;

  sdk.sendEvent({
    interaction: {
      name,
      attributes: {
        ...attributes,
        presentationTitle: 'TDX 26 System of Context Mega Demo',
      },
    },
  });
}

// --- Public event senders ---

export function trackSlideView(slideIndex: number) {
  sendEvent('Slide View', {
    slideIndex,
    slideNumber: slideIndex + 1,
    slideLabel: SLIDE_LABELS[slideIndex] || `Slide ${slideIndex + 1}`,
  });
}

export function trackPlay(slideIndex: number) {
  sendEvent('Play', {
    slideIndex,
    slideLabel: SLIDE_LABELS[slideIndex] || `Slide ${slideIndex + 1}`,
  });
}

export function trackPause(slideIndex: number) {
  sendEvent('Pause', {
    slideIndex,
    slideLabel: SLIDE_LABELS[slideIndex] || `Slide ${slideIndex + 1}`,
  });
}

export function trackMute() {
  sendEvent('Mute');
}

export function trackUnmute() {
  sendEvent('Unmute');
}

export function trackVoiceChange(voiceId: string) {
  sendEvent('Voice Change', { voiceId });
}

export function trackSlideJump(fromIndex: number, toIndex: number) {
  sendEvent('Slide Jump', {
    fromSlide: fromIndex + 1,
    fromLabel: SLIDE_LABELS[fromIndex] || `Slide ${fromIndex + 1}`,
    toSlide: toIndex + 1,
    toLabel: SLIDE_LABELS[toIndex] || `Slide ${toIndex + 1}`,
  });
}

export function trackLinkClick(href: string, slideIndex: number) {
  sendEvent('Link Click', {
    href,
    slideIndex,
    slideLabel: SLIDE_LABELS[slideIndex] || `Slide ${slideIndex + 1}`,
  });
}

export function trackPresentationComplete(totalSlides: number) {
  sendEvent('Presentation Complete', {
    totalSlides,
  });
}

// --- Hook for initializing the SDK ---

export function useDataCloudInit() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const sdk = getSdk();
    if (!sdk) {
      console.debug('[DataCloud] SDK not loaded — tracking disabled');
      return;
    }

    sdk.init({
      consents: [{
        provider: 'MegaDemo',
        purpose: sdk.ConsentPurpose.Tracking,
        status: sdk.ConsentStatus.OptIn,
      }],
    }).then(() => {
      console.debug('[DataCloud] SDK initialized');
    });
  }, []);
}
