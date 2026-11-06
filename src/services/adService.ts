import { Difficulty, AdType } from '../types/game';

export interface AdDecision {
  requiresAd: boolean;
  adType?: AdType;
  title?: string;
  durationSeconds?: number;
  message?: string;
}

/**
 * Check whether an ad should be displayed before entering a difficulty level.
 * - Easy: Always Free
 * - Medium: 4 matches free, 5th requires Ad
 * - Hard: Every match requires Ad
 */
export function evaluateDifficultyAdRequirement(
  difficulty: Difficulty,
  nextMediumMatchNumber: number
): AdDecision {
  if (difficulty === 'Easy') {
    return { requiresAd: false };
  }

  if (difficulty === 'Medium') {
    if (nextMediumMatchNumber % 5 === 0) {
      return {
        requiresAd: true,
        adType: 'INTERSTITIAL',
        title: 'Sponsor Ad (Medium Mode)',
        durationSeconds: 4,
        message: `Match #${nextMediumMatchNumber} requires a short sponsor ad before starting.`,
      };
    }
    const remainingBeforeAd = 5 - (nextMediumMatchNumber % 5);
    return {
      requiresAd: false,
      message: `${remainingBeforeAd} free match${remainingBeforeAd > 1 ? 'es' : ''} remaining before next ad.`,
    };
  }

  if (difficulty === 'Hard') {
    return {
      requiresAd: true,
      adType: 'INTERSTITIAL',
      title: 'Sponsor Ad (Hard Mode)',
      durationSeconds: 4,
      message: 'Hard mode requires a short sponsor ad before starting.',
    };
  }

  return { requiresAd: false };
}

export function getHintRewardedAdConfig() {
  return {
    adType: 'REWARDED' as AdType,
    title: 'Watch Ad for Hint',
    durationSeconds: 5,
    message: 'Watch a short simulated rewarded video to unlock a free hint.',
  };
}
