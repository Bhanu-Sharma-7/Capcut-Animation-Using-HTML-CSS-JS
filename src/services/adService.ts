import { Platform, NativeModules, TurboModuleRegistry } from 'react-native';
import Constants, { ExecutionEnvironment, AppOwnership } from 'expo-constants';
import type {
  RewardedAd,
  InterstitialAd,
  RewardedAdEventType as RewardedAdEventTypeType,
  AdEventType as AdEventTypeType,
} from 'react-native-google-mobile-ads';
import { Difficulty, AdType } from '../types/game';

// AdMob Production & Test Unit IDs
const REWARDED_AD_UNIT = __DEV__
  ? 'ca-app-pub-3940256099942544/5224354917' // Google Official Test Rewarded ID
  : 'ca-app-pub-2081458619165865/6842837333';

const INTERSTITIAL_AD_UNIT = __DEV__
  ? 'ca-app-pub-3940256099942544/1033173712' // Google Official Test Interstitial ID
  : 'ca-app-pub-2081458619165865/7979825030';

let isInitialized = false;
let interstitialAdInstance: InterstitialAd | null = null;
let isInterstitialLoaded = false;

let rewardedAdInstance: RewardedAd | null = null;
let isRewardedLoaded = false;

/**
 * Detect whether the native Google Mobile Ads module is supported and present.
 * Returns false when running inside Expo Go, Web, or when binary lacks the native module.
 */
export function isNativeAdMobSupported(): boolean {
  if (Platform.OS === 'web') {
    return false;
  }

  // Check Expo Go environment
  try {
    if (
      Constants.appOwnership === AppOwnership.Expo ||
      Constants.appOwnership === 'expo' ||
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient
    ) {
      return false;
    }
  } catch {
    // Continue to native module checks if constants check fails
  }

  // Check if native module is registered in the native binary
  try {
    const hasModule =
      Boolean(NativeModules?.RNGoogleMobileAdsModule) ||
      Boolean(TurboModuleRegistry?.get?.('RNGoogleMobileAdsModule'));

    if (!hasModule) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
}

/**
 * Lazy getter for react-native-google-mobile-ads.
 * Returns null in Expo Go or when native module is missing, preventing crashes.
 */
function getGoogleMobileAds(): typeof import('react-native-google-mobile-ads') | null {
  if (!isNativeAdMobSupported()) {
    return null;
  }

  try {
    // Dynamically require so that Expo Go never bundles the enforcing TurboModule
    return require('react-native-google-mobile-ads');
  } catch (error) {
    console.warn('Native Google Mobile Ads module could not be required:', error);
    return null;
  }
}

/**
 * Initialize Google Mobile Ads SDK (Native Standalone / Production builds only)
 */
export async function initializeMobileAds(): Promise<void> {
  const gma = getGoogleMobileAds();
  if (!gma || isInitialized) return;

  try {
    await gma.default().initialize();
    isInitialized = true;
    preloadInterstitial();
    preloadRewarded();
  } catch (error) {
    console.warn('Google Mobile Ads initialization warning:', error);
  }
}

/**
 * Preload Interstitial Ad
 */
export function preloadInterstitial(): void {
  const gma = getGoogleMobileAds();
  if (!gma) return;

  try {
    const adUnitId = __DEV__ ? gma.TestIds.INTERSTITIAL : INTERSTITIAL_AD_UNIT;
    interstitialAdInstance = gma.InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    interstitialAdInstance.addAdEventListener(gma.AdEventType.LOADED, () => {
      isInterstitialLoaded = true;
    });

    interstitialAdInstance.addAdEventListener(gma.AdEventType.CLOSED, () => {
      isInterstitialLoaded = false;
      preloadInterstitial();
    });

    interstitialAdInstance.addAdEventListener(gma.AdEventType.ERROR, (error) => {
      console.warn('Interstitial ad load error:', error);
      isInterstitialLoaded = false;
    });

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
  const gma = getGoogleMobileAds();
  if (!gma) return;

  try {
    const adUnitId = __DEV__ ? gma.TestIds.REWARDED : REWARDED_AD_UNIT;
    rewardedAdInstance = gma.RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    rewardedAdInstance.addAdEventListener(
      gma.RewardedAdEventType.LOADED,
      () => {
        isRewardedLoaded = true;
      }
    );

    rewardedAdInstance.addAdEventListener(gma.AdEventType.CLOSED, () => {
      isRewardedLoaded = false;
      preloadRewarded();
    });

    rewardedAdInstance.addAdEventListener(gma.AdEventType.ERROR, (error) => {
      console.warn('Rewarded ad load error:', error);
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
 * - Uses real AdMob on standalone builds
 * - Seamlessly falls back to simulated ad or direct reward in Expo Go or on load failure
 */
export function showHintRewardedAd(
  onRewardEarned: () => void,
  onFallbackModal?: () => void
): void {
  const gma = getGoogleMobileAds();

  if (gma && rewardedAdInstance && isRewardedLoaded) {
    let earned = false;

    const unsubEarned = rewardedAdInstance.addAdEventListener(
      gma.RewardedAdEventType.EARNED_REWARD,
      () => {
        earned = true;
      }
    );

    const unsubClosed = rewardedAdInstance.addAdEventListener(
      gma.AdEventType.CLOSED,
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
        console.warn('Failed to display real rewarded ad, activating fallback:', err);
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
      console.warn('Exception displaying rewarded ad:', err);
    }
  }

  // Graceful fallback for Expo Go or when ad is not cached
  if (onFallbackModal) {
    onFallbackModal();
  } else {
    onRewardEarned();
  }
}

/**
 * Show Interstitial Ad before level start
 * - Used for Hard mode and every 5th Medium match
 * - Uses real AdMob on standalone builds
 * - Seamlessly falls back to simulated ad or direct start in Expo Go or on load failure
 */
export function showLevelInterstitialAd(
  onClosed: () => void,
  onFallbackModal?: () => void
): void {
  const gma = getGoogleMobileAds();

  if (gma && interstitialAdInstance && isInterstitialLoaded) {
    const unsubClosed = interstitialAdInstance.addAdEventListener(
      gma.AdEventType.CLOSED,
      () => {
        unsubClosed();
        onClosed();
      }
    );

    try {
      interstitialAdInstance.show().catch((err) => {
        console.warn('Failed to display real interstitial ad, activating fallback:', err);
        unsubClosed();
        if (onFallbackModal) {
          onFallbackModal();
        } else {
          onClosed();
        }
      });
      return;
    } catch (err) {
      console.warn('Exception displaying interstitial ad:', err);
    }
  }

  // Graceful fallback for Expo Go or when ad is not cached
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
        title: 'Sponsor Ad • Medium Match #5',
        durationSeconds: 4,
        message: `Match #${nextMediumMatchNumber} requires an ad before starting.`,
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
      title: 'Sponsor Ad • Hard Mode',
      durationSeconds: 4,
      message: 'Hard mode requires an ad before starting.',
    };
  }

  return { requiresAd: false };
}

export function getHintRewardedAdConfig() {
  return {
    adType: 'REWARDED' as AdType,
    title: 'Sponsor Ad • Rewarded Hint',
    durationSeconds: 5,
    message: 'Watch a short rewarded ad to unlock a free hint.',
  };
}
