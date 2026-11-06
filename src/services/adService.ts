import { Platform } from 'react-native';
import mobileAds, {
  RewardedAd,
  InterstitialAd,
  AdEventType,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { Difficulty, AdType } from '../types/game';

// AdMob Unit IDs
const REWARDED_AD_UNIT = __DEV__
  ? TestIds.REWARDED
  : 'ca-app-pub-2081458619165865/6842837333';

const INTERSTITIAL_AD_UNIT = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-2081458619165865/7979825030';

let isInitialized = false;
let interstitialAdInstance: InterstitialAd | null = null;
let isInterstitialLoaded = false;

let rewardedAdInstance: RewardedAd | null = null;
let isRewardedLoaded = false;

/**
 * Initialize Google Mobile Ads SDK (Native platforms only)
 */
export async function initializeMobileAds(): Promise<void> {
  if (Platform.OS === 'web' || isInitialized) return;

  try {
    await mobileAds().initialize();
    isInitialized = true;
    // Preload initial ad instances
    preloadInterstitial();
    preloadRewarded();
  } catch (error) {
    console.warn('Google Mobile Ads initialization notice:', error);
  }
}

/**
 * Preload Interstitial Ad
 */
export function preloadInterstitial(): void {
  if (Platform.OS === 'web') return;

  try {
    interstitialAdInstance = InterstitialAd.createForAdRequest(
      INTERSTITIAL_AD_UNIT,
      {
        requestNonPersonalizedAdsOnly: true,
      }
    );

    const unsubscribeLoaded = interstitialAdInstance.addAdEventListener(
      AdEventType.LOADED,
      () => {
        isInterstitialLoaded = true;
      }
    );

    const unsubscribeClosed = interstitialAdInstance.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        isInterstitialLoaded = false;
        // Preload next
        preloadInterstitial();
      }
    );

    const unsubscribeError = interstitialAdInstance.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.warn('Interstitial ad error:', error);
        isInterstitialLoaded = false;
      }
    );

    interstitialAdInstance.load();
  } catch (error) {
    console.warn('Could not preload Interstitial Ad:', error);
    isInterstitialLoaded = false;
  }
}

/**
 * Preload Rewarded Ad
 */
export function preloadRewarded(): void {
  if (Platform.OS === 'web') return;

  try {
    rewardedAdInstance = RewardedAd.createForAdRequest(REWARDED_AD_UNIT, {
      requestNonPersonalizedAdsOnly: true,
    });

    rewardedAdInstance.addAdEventListener(RewardedAdEventType.LOADED, () => {
      isRewardedLoaded = true;
    });

    rewardedAdInstance.addAdEventListener(AdEventType.CLOSED, () => {
      isRewardedLoaded = false;
      // Preload next
      preloadRewarded();
    });

    rewardedAdInstance.addAdEventListener(AdEventType.ERROR, (error) => {
      console.warn('Rewarded ad error:', error);
      isRewardedLoaded = false;
    });

    rewardedAdInstance.load();
  } catch (error) {
    console.warn('Could not preload Rewarded Ad:', error);
    isRewardedLoaded = false;
  }
}

/**
 * Show Rewarded Ad for in-game hint
 * - Falls back smoothly to simulated ad or direct reward if ad fails or on unsupported device
 */
export function showHintRewardedAd(
  onRewardEarned: () => void,
  onFallbackModal?: () => void
): void {
  if (Platform.OS !== 'web' && rewardedAdInstance && isRewardedLoaded) {
    let earned = false;

    const unsubEarned = rewardedAdInstance.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        earned = true;
      }
    );

    const unsubClosed = rewardedAdInstance.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        unsubEarned();
        unsubClosed();
        if (earned) {
          onRewardEarned();
        }
      }
    );

    try {
      rewardedAdInstance.show().catch((err) => {
        console.warn('Failed to show real rewarded ad, executing fallback:', err);
        unsubEarned();
        unsubClosed();
        if (onFallbackModal) {
          onFallbackModal();
        } else {
          onRewardEarned();
        }
      });
      return;
    } catch (err) {
      console.warn('Exception showing rewarded ad:', err);
    }
  }

  // Fallback to simulated ad or direct reward
  if (onFallbackModal) {
    onFallbackModal();
  } else {
    onRewardEarned();
  }
}

/**
 * Show Interstitial Ad before level start
 * - Used for Hard mode and every 5th Medium match
 * - Falls back smoothly if unavailable
 */
export function showLevelInterstitialAd(
  onClosed: () => void,
  onFallbackModal?: () => void
): void {
  if (Platform.OS !== 'web' && interstitialAdInstance && isInterstitialLoaded) {
    const unsubClosed = interstitialAdInstance.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        unsubClosed();
        onClosed();
      }
    );

    try {
      interstitialAdInstance.show().catch((err) => {
        console.warn('Failed to show real interstitial ad, executing fallback:', err);
        unsubClosed();
        if (onFallbackModal) {
          onFallbackModal();
        } else {
          onClosed();
        }
      });
      return;
    } catch (err) {
      console.warn('Exception showing interstitial ad:', err);
    }
  }

  // Fallback to simulated ad or direct play
  if (onFallbackModal) {
    onFallbackModal();
  } else {
    onClosed();
  }
}

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
        title: 'Google AdMob • Medium Match #5',
        durationSeconds: 4,
        message: `Match #${nextMediumMatchNumber} requires a sponsor ad before starting.`,
      };
    }
    const remainingBeforeAd = 5 - (nextMediumMatchNumber % 5);
    return {
      requiresAd: false,
      message: `${remainingBeforeAd} free match${
        remainingBeforeAd > 1 ? 'es' : ''
      } remaining before next ad.`,
    };
  }

  if (difficulty === 'Hard') {
    return {
      requiresAd: true,
      adType: 'INTERSTITIAL',
      title: 'Google AdMob • Hard Mode',
      durationSeconds: 4,
      message: 'Hard mode requires a sponsor ad before starting.',
    };
  }

  return { requiresAd: false };
}

export function getHintRewardedAdConfig() {
  return {
    adType: 'REWARDED' as AdType,
    title: 'Google AdMob • Rewarded Hint',
    durationSeconds: 5,
    message: 'Watch a short rewarded ad to unlock a free hint.',
  };
}
