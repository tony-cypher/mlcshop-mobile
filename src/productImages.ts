import type { ImageSourcePropType } from 'react-native';

const localImageMap: Record<string, ImageSourcePropType> = {
  'acoustic-guitar-starter-kit': require('../assets/img/products/acoustic-guitar-starter-kit.jpg'),
  'adidas-originals-graphic-tee': require('../assets/img/products/adidas-originals-graphic-tee.jpg'),
  'adidas-training-duffel-bag': require('../assets/img/products/adidas-training-duffel-bag.jpg'),
  'adjustable-dumbbell-set-20-kg': require('../assets/img/products/adjustable-dumbbell-set-20-kg.jpg'),
  'adjustable-wooden-canvas-easel': require('../assets/img/products/adjustable-wooden-canvas-easel.jpg'),
  'aroma-mist-diffuser-lamp': require('../assets/img/products/aroma-mist-diffuser-lamp.jpg'),
  'asics-gel-quantum-running-shoes': require('../assets/img/products/asics-gel-quantum-running-shoes.jpg'),
  'asics-sportstyle-running-cap': require('../assets/img/products/asics-sportstyle-running-cap.jpg'),
  'botanical-scented-candle-trio': require('../assets/img/products/botanical-scented-candle-trio.jpg'),
  'ceramic-nonstick-cookware-set-5-pc': require('../assets/img/products/ceramic-nonstick-cookware-set-5-pc.jpg'),
  'club-kit-1-recurve-archery-bow': require('../assets/img/products/club-kit-1-recurve-archery-bow.jpg'),
  'columbia-rapid-shield-windbreaker': require('../assets/img/products/columbia-rapid-shield-windbreaker.jpg'),
  'columbia-steens-fleece-pullover': require('../assets/img/products/columbia-steens-fleece-pullover.jpg'),
  'cozy-knit-throw-blanket': require('../assets/img/products/cozy-knit-throw-blanket.jpg'),
  'crypto-trader-enamel-mug': require('../assets/img/products/crypto-trader-enamel-mug.jpg'),
  'insulated-steel-water-bottle-750ml': require('../assets/img/products/insulated-steel-water-bottle-750ml.jpg'),
  'lightweight-white-nike-training-shoes': require('../assets/img/products/lightweight-white-nike-training-shoes.jpg'),
  'minimalist-led-desk-lamp': require('../assets/img/products/minimalist-led-desk-lamp.jpg'),
  'new-balance-574-classic-sneakers': require('../assets/img/products/new-balance-574-classic-sneakers.jpg'),
  'nike-white-thermo-fit-pullover-training-hoodie': require('../assets/img/products/nike-white-thermo-fit-pullover-training-hoodie.jpg'),
  'portable-bluetooth-speaker-splashproof': require('../assets/img/products/portable-bluetooth-speaker-splashproof.jpg'),
  'premium-boxing-gloves-for-pro-training': require('../assets/img/products/premium-boxing-gloves-for-pro-training.jpg'),
  'pro-grip-badminton-shuttlecocks-12-pack': require('../assets/img/products/pro-grip-badminton-shuttlecocks-12-pack.jpg'),
  'pro-wireless-controller-gamepad': require('../assets/img/products/pro-wireless-controller-gamepad.jpg'),
  'resistance-bands-set-5-pieces': require('../assets/img/products/resistance-bands-set-5-pieces.jpg'),
  'rgb-mechanical-gaming-keyboard': require('../assets/img/products/rgb-mechanical-gaming-keyboard.jpg'),
  'secure-element-hardware-wallet': require('../assets/img/products/secure-element-hardware-wallet.jpg'),
  'smart-watch-wh22-6-fitness-tracker': require('../assets/img/products/smart-watch-wh22-6-fitness-tracker.jpg'),
  'tennis-rackets-for-beginners': require('../assets/img/products/tennis-rackets-for-beginners.jpg'),
  'ultralight-gaming-mouse-8k': require('../assets/img/products/ultralight-gaming-mouse-8k.jpg'),
  'watercolor-paint-set-36-colors': require('../assets/img/products/watercolor-paint-set-36-colors.jpg'),
  'wireless-studio-headphones-pro': require('../assets/img/products/wireless-studio-headphones-pro.jpg'),
  'xiaomi-mi-smart-body-scale': require('../assets/img/products/xiaomi-mi-smart-body-scale.jpg'),
};

export function getProductImageSource(
  imageUrl?: string | null,
  slug?: string | null,
): ImageSourcePropType | null {
  // 1. Try slug key
  if (slug && localImageMap[slug]) {
    return localImageMap[slug];
  }

  // 2. Try extract basename from image_url
  if (imageUrl) {
    const filename = imageUrl.split('/').pop()?.replace(/\.[^/.]+$/, '');
    if (filename && localImageMap[filename]) {
      return localImageMap[filename];
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return { uri: imageUrl };
    }

    return { uri: `https://mlcshop.onrender.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}` };
  }

  return null;
}
