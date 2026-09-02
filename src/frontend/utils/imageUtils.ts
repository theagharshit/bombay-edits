function getStableSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const FASHION_IDS = [
  '1503160865267-af4660ce7bf2', // Indian woman fashion
  '1569810020669-aa9d38003ea7', // Ethnic wear
  '1571587289339-cb7da03fb5a6', // Jewelry / Indian details
  '1571908599407-cdb918ed83bf', // Traditional clothing
  '1592763786796-80c5183faec2', // Saree details
  '1610048869310-d889ff25c374', // Indian wedding
  '1610202631408-fa6ba0f39ca3', // Saree fashion
  '1616583936499-d4116e7e2e76', // Wedding dress details
  '1619516388835-2b60acc4049e', // Mehndi / Hand details
  '1619715613791-89d35b51ff81', // Traditional Indian wear
  '1654764746225-e63f5e90facd', // Indian model
  '1713296008556-29c7fae52234', // Festive wear
  '1760287363878-1a09af715b80', // Couture
  '1764928947261-f5687e0faa4a', // Lehenga
];

const ARCH_IDS = [
  '1519955045385-7cdb8e07c76f', // Architecture
  '1519955266818-0231b63402bc', // India arch
  '1524228529766-4d7fe5dc55ca', // Forts/Arch
  '1524230507669-5ff97982bb5e', // Gateway / historical
  '1532664189809-02133fee698d', // Indian streets
  '1601887389937-0ea1d8213693', // Working architecture replacement
];

export function generatePlaceholderImage(
  width: number,
  height: number,
  seedStr: string = 'default'
): string {
  const seed = getStableSeed(seedStr);
  const isArch = seedStr === 'heritage' || seedStr === 'craft';
  const sourceList = isArch ? ARCH_IDS : FASHION_IDS;
  const id = sourceList[seed % sourceList.length];
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}

export function getProductPlaceholder(
  type: 'front' | 'back' | 'detail' | 'lifestyle',
  slug: string = 'product'
): string {
  const seed = getStableSeed(slug + type);
  const id = FASHION_IDS[seed % FASHION_IDS.length];
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${600}&h=${800}&q=80`;
}
