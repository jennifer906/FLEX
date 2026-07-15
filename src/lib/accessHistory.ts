export interface AccessHistoryEntry {
  id: string;
  complexId: string;
  dong: string;
  code: string;
  date: string;
  phone: string;
}

// 단지(complexId) 단위로 스코프해서, 배송지와 같은 동 기록 / 같은 단지의 다른 동 기록을 구분해 보여준다.
// 실제로 같은 단지는 동마다 공동현관 비밀번호가 같은 경우가 많아, 다른 동 기록도 유효한 단서가 된다.
// 같은 동에 등록된 정보가 많을 수 있어(최신 3개월 전체 노출) 목동9(동문굿모닝탑I) 9동에 예시를 넉넉히 넣어둔다.
// 카드 안에는 어느 동인지(동 배지/섹션 라벨) 다시 쓰지 않고 비밀번호만 노출한다 - 중복이라서.
export const ACCESS_HISTORY: AccessHistoryEntry[] = [
  { id: "h1", complexId: "dongmoon-mokdong", dong: "9동", code: "1234#", date: "2026-07-06", phone: "0105508****" },
  { id: "h1b", complexId: "dongmoon-mokdong", dong: "9동", code: "1234#", date: "2026-06-28", phone: "0107712****" },
  { id: "h1c", complexId: "dongmoon-mokdong", dong: "9동", code: "5521#", date: "2026-06-15", phone: "0103391****" },
  { id: "h1d", complexId: "dongmoon-mokdong", dong: "9동", code: "1234#", date: "2026-06-01", phone: "0108820****" },
  { id: "h1e", complexId: "dongmoon-mokdong", dong: "9동", code: "1234#", date: "2026-05-20", phone: "0106654****" },
  { id: "h1f", complexId: "dongmoon-mokdong", dong: "9동", code: "9012#", date: "2026-05-10", phone: "0104433****" },
  { id: "h1g", complexId: "dongmoon-mokdong", dong: "9동", code: "1234#", date: "2026-04-25", phone: "0102290****" },
  { id: "h1h", complexId: "dongmoon-mokdong", dong: "9동", code: "1234#", date: "2026-04-15", phone: "0109981****" },
  { id: "h1i", complexId: "dongmoon-mokdong", dong: "9동", code: "5521#", date: "2026-04-11", phone: "0105567****" },
  // 같은 동 5건+더보기 데모용 예시 5건(전부 3개월 이내, 서로 다른 코드)
  { id: "h1m", complexId: "dongmoon-mokdong", dong: "9동", code: "6789#", date: "2026-06-25", phone: "0107788****" },
  { id: "h1n", complexId: "dongmoon-mokdong", dong: "9동", code: "4321#", date: "2026-05-30", phone: "0102233****" },
  { id: "h1o", complexId: "dongmoon-mokdong", dong: "9동", code: "8765#", date: "2026-05-05", phone: "0106611****" },
  { id: "h1p", complexId: "dongmoon-mokdong", dong: "9동", code: "2468#", date: "2026-04-28", phone: "0104455****" },
  { id: "h1q", complexId: "dongmoon-mokdong", dong: "9동", code: "1357#", date: "2026-04-15", phone: "0109900****" },
  // 아래 3개는 3개월(2026-04-10)보다 오래돼서 목록에서 자동으로 빠져야 한다
  { id: "h1j", complexId: "dongmoon-mokdong", dong: "9동", code: "0000#", date: "2026-03-20", phone: "0101111****" },
  { id: "h1k", complexId: "dongmoon-mokdong", dong: "9동", code: "3333#", date: "2026-02-14", phone: "0102222****" },
  { id: "h1l", complexId: "dongmoon-mokdong", dong: "9동", code: "7777#", date: "2026-01-01", phone: "0103333****" },
  { id: "h2", complexId: "dongmoon-mokdong", dong: "5동", code: "8890#", date: "2026-06-20", phone: "0109981****" },
  { id: "h3", complexId: "dongmoon-mokdong", dong: "12동", code: "8890#", date: "2026-05-11", phone: "0107744****" },
  // 다른 동 5건 추가 데모용 예시(서로 다른 동 + 서로 다른 코드)
  { id: "h2b", complexId: "dongmoon-mokdong", dong: "3동", code: "1111#", date: "2026-06-10", phone: "0103344****" },
  { id: "h2c", complexId: "dongmoon-mokdong", dong: "7동", code: "2222#", date: "2026-05-22", phone: "0108811****" },
  { id: "h2d", complexId: "dongmoon-mokdong", dong: "10동", code: "9999#", date: "2026-05-01", phone: "0105566****" },
  { id: "h2e", complexId: "dongmoon-mokdong", dong: "6동", code: "4444#", date: "2026-04-20", phone: "0107722****" },
  { id: "h2f", complexId: "dongmoon-mokdong", dong: "2동", code: "5555#", date: "2026-04-12", phone: "0109933****" },
  { id: "h4", complexId: "daesung-hwagok", dong: "3동", code: "4471#", date: "2026-06-02", phone: "0102231****" },
  { id: "h5", complexId: "wellbeing-sangam", dong: "5동", code: "자유 출입", date: "2026-05-18", phone: "0106602****" },
];

// 데모 데이터가 2026년 기준으로 맞춰져 있어 실제 브라우저 시각 대신 고정된 기준일로 "최신 3개월"을 계산한다.
const TODAY_REF = new Date("2026-07-10");
const THREE_MONTHS_AGO = new Date(TODAY_REF);
THREE_MONTHS_AGO.setMonth(THREE_MONTHS_AGO.getMonth() - 3);
export function isWithinLast3Months(dateStr: string) {
  return new Date(dateStr) >= THREE_MONTHS_AGO;
}

// 이력 카드에 "몇 월 며칠 등록" 형태로 보여주기 위한 짧은 날짜 포맷.
export function formatHistoryDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${parseInt(m, 10)}월 ${parseInt(d, 10)}일`;
}

// 등록자 전화번호는 이미 뒷 4자리가 마스킹된 채로 저장되어 있다("0105508****") - 가독성을 위해 하이픈만 붙여준다.
export function formatMaskedPhone(phone: string): string {
  if (phone.length !== 11) return phone;
  return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
}

// 최신 등록 순으로 정렬한다.
export function byRecency(a: AccessHistoryEntry, b: AccessHistoryEntry) {
  return b.date.localeCompare(a.date);
}
