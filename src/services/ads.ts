import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';

const PDF_OPEN_INTERSTITIAL_LAST_SHOWN_KEY = 'ads:pdf_open_interstitial:last_shown_at';
const PDF_OPEN_INTERSTITIAL_OPEN_COUNT_KEY = 'ads:pdf_open_interstitial:open_count_since_last_ad';
const PDF_OPEN_INTERSTITIAL_COOLDOWN_MINUTES = 10;
const PDF_OPEN_INTERSTITIAL_MIN_OPEN_COUNT = 3;

const PDF_OPEN_INTERSTITIAL_REAL_AD_UNIT_ID = '';

const pdfOpenInterstitialAdUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : PDF_OPEN_INTERSTITIAL_REAL_AD_UNIT_ID;

let pdfOpenInterstitialAd: InterstitialAd | null = null;
let isPdfOpenInterstitialLoading = false;

export function preloadPdfOpenInterstitialAd() {
  if (!pdfOpenInterstitialAdUnitId || pdfOpenInterstitialAd?.loaded || isPdfOpenInterstitialLoading) {
    return;
  }

  isPdfOpenInterstitialLoading = true;
  const interstitial = InterstitialAd.createForAdRequest(pdfOpenInterstitialAdUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });

  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    pdfOpenInterstitialAd = interstitial;
    isPdfOpenInterstitialLoading = false;
  });

  interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
    console.log('Interstitial preload error:', error);
    if (pdfOpenInterstitialAd === interstitial) {
      pdfOpenInterstitialAd = null;
    }
    isPdfOpenInterstitialLoading = false;
  });

  interstitial.load();
}

async function recordPdfOpenForInterstitialAd() {
  const openCount = await AsyncStorage.getItem(PDF_OPEN_INTERSTITIAL_OPEN_COUNT_KEY);
  const nextOpenCount = Number(openCount || 0) + 1;

  await AsyncStorage.setItem(
    PDF_OPEN_INTERSTITIAL_OPEN_COUNT_KEY,
    String(nextOpenCount),
  );

  return nextOpenCount;
}

async function canShowPdfOpenInterstitialAd() {
  if (!pdfOpenInterstitialAd?.loaded) {
    return false;
  }

  const openCount = Number(
    await AsyncStorage.getItem(PDF_OPEN_INTERSTITIAL_OPEN_COUNT_KEY) || 0,
  );

  if (openCount < PDF_OPEN_INTERSTITIAL_MIN_OPEN_COUNT) {
    return false;
  }

  const lastShownAt = await AsyncStorage.getItem(PDF_OPEN_INTERSTITIAL_LAST_SHOWN_KEY);

  if (!lastShownAt) {
    return true;
  }

  const elapsedMs = Date.now() - Number(lastShownAt);
  const cooldownMs = PDF_OPEN_INTERSTITIAL_COOLDOWN_MINUTES * 60 * 1000;

  return elapsedMs >= cooldownMs;
}

function showInterstitialAd() {
  return new Promise<boolean>((resolve) => {
    const interstitial = pdfOpenInterstitialAd;

    if (!interstitial?.loaded) {
      preloadPdfOpenInterstitialAd();
      resolve(false);
      return;
    }

    let settled = false;
    const subscriptions: Array<() => void> = [];

    const finish = (shown: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      subscriptions.forEach((unsubscribe) => unsubscribe());
      pdfOpenInterstitialAd = null;
      preloadPdfOpenInterstitialAd();
      resolve(shown);
    };

    subscriptions.push(
      interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        finish(true);
      }),
    );

    subscriptions.push(
      interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
        console.log('Interstitial load error:', error);
        finish(false);
      }),
    );

    try {
      interstitial.show();
    } catch (error) {
      console.log('Interstitial show error:', error);
      finish(false);
    }
  });
}

export async function showPdfOpenInterstitialAd() {
  if (!pdfOpenInterstitialAdUnitId) {
    return false;
  }

  await recordPdfOpenForInterstitialAd();
  preloadPdfOpenInterstitialAd();

  const shouldShow = await canShowPdfOpenInterstitialAd();
  if (!shouldShow) {
    return false;
  }

  const shown = await showInterstitialAd();

  if (shown) {
    await Promise.all([
      AsyncStorage.setItem(
        PDF_OPEN_INTERSTITIAL_LAST_SHOWN_KEY,
        String(Date.now()),
      ),
      AsyncStorage.setItem(PDF_OPEN_INTERSTITIAL_OPEN_COUNT_KEY, '0'),
    ]);
  }

  return shown;
}
