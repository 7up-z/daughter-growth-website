import { normalizeString, requiredString } from "@/lib/validation"

export const chinaProvinces = [
  "北京", "天津", "河北", "山西", "内蒙古", "辽宁", "吉林", "黑龙江",
  "上海", "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南",
  "广东", "广西", "海南", "重庆", "四川", "贵州", "云南", "西藏",
  "陕西", "甘肃", "青海", "宁夏", "新疆", "香港", "澳门", "台湾",
] as const

export const countryCodes = (
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ " +
  "CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR " +
  "GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP " +
  "KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT " +
  "MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW " +
  "SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG " +
  "UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW"
).split(" ")

const countryNames = new Intl.DisplayNames(["zh-CN"], { type: "region" })
const chinaRegions: Record<string, string> = { HK: "香港", MO: "澳门", TW: "台湾" }

export type EntryType = "travel" | "photo"

export type EntryPlace = {
  country: string
  province: string
  city: string
  label: string
  latitude: number
  longitude: number
}

export type PlaceDraft = Omit<EntryPlace, "latitude" | "longitude"> & {
  latitude: number | null
  longitude: number | null
}

export type MappedEntry = {
  id: string
  type: EntryType
  title: string
  date: string
  place: EntryPlace
}

export function isChinaPlace(country: string) {
  return country === "CN" || Object.hasOwn(chinaRegions, country)
}

export function provinceForCountry(country: string) {
  return chinaRegions[country] ?? ""
}

export function countryName(country: string) {
  return country === "CN" ? "中国" : countryNames.of(country) ?? country
}

export function placeName(place: EntryPlace) {
  return [...new Set([
    isChinaPlace(place.country) ? place.province : countryName(place.country),
    place.city,
    place.label,
  ].filter(Boolean))].join(" · ")
}

export function placeEntryHref(entry: Pick<MappedEntry, "id" | "type">) {
  const id = encodeURIComponent(entry.id)
  return entry.type === "travel" ? `/travel/${id}` : `/gallery?photo=${id}`
}

export function parseEntryPlace(value: unknown): EntryPlace | null {
  if (value === undefined || value === null) return null
  if (typeof value !== "object" || Array.isArray(value)) throw new Error("地点格式不正确")
  const raw = value as Record<string, unknown>
  const country = typeof raw.country === "string" ? raw.country.trim().toUpperCase() : ""
  if (!countryCodes.includes(country)) throw new Error("请选择国家或地区")

  const province = provinceForCountry(country) || normalizeString(raw.province, 60)
  if (country === "CN" && !chinaProvinces.some((name) => name === province)) {
    throw new Error("请选择省级地区")
  }

  const city = requiredString(raw.city, "城市", 80)
  const label = normalizeString(raw.label, 100)
  const { latitude, longitude } = raw
  if (typeof latitude !== "number" || !Number.isFinite(latitude) || latitude < -85 || latitude > 85 ||
      typeof longitude !== "number" || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error("请在地图上选择标记，或填入有效的经纬度")
  }

  return {
    country, province, city, label,
    latitude: Math.round(latitude * 1e6) / 1e6,
    longitude: Math.round(longitude * 1e6) / 1e6,
  }
}

export function readEntryPlace(value: unknown) {
  try {
    return parseEntryPlace(value)
  } catch {
    return null
  }
}
