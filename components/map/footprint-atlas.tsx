"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Camera, MapPin } from "lucide-react"
import { countryName, isChinaPlace, placeEntryHref, placeName, type MappedEntry } from "@/lib/entry-place"
import { focusBounds, GeoSurface, overviewBounds, regionBounds, useAtlasShapes, type AtlasPin, type MapView } from "./geo-surface"

const dateFormat = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Shanghai",
})

type Group = { id: string; name: string; entries: MappedEntry[] }

function groupEntries(entries: MappedEntry[], key: (entry: MappedEntry) => string, label: (id: string, entry: MappedEntry) => string) {
  const groups = new Map<string, Group>()
  for (const entry of entries) {
    const id = key(entry)
    const group = groups.get(id)
    if (group) group.entries.push(entry)
    else groups.set(id, { id, name: label(id, entry), entries: [entry] })
  }
  return [...groups.values()].sort((a, b) => b.entries.length - a.entries.length || a.name.localeCompare(b.name, "zh"))
}

function worldRegion(entry: MappedEntry) {
  return isChinaPlace(entry.place.country) ? "CN" : entry.place.country
}

function cityKey({ place }: MappedEntry) {
  return `${place.province}\u0000${place.city.toLocaleLowerCase("zh-CN").replace(/市$/, "")}`
}

export function FootprintAtlas({ focus }: { focus?: string }) {
  const [entries, setEntries] = useState<MappedEntry[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [view, setView] = useState<MapView>("world")
  const [region, setRegion] = useState("")
  const [city, setCity] = useState("")
  const [type, setType] = useState("all")
  const shapes = useAtlasShapes()

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const response = await fetch("/api/memory/places", { signal: controller.signal, cache: "no-store" })
        if (!response.ok) throw new Error("足迹读取失败")
        const data: MappedEntry[] = await response.json()
        if (controller.signal.aborted) return
        setEntries(data)
        const target = focus ? data.find((entry) => `${entry.type}:${entry.id}` === focus) : undefined
        if (target) {
          const china = isChinaPlace(target.place.country)
          setView(china ? "china" : "world")
          setRegion(china ? target.place.province : worldRegion(target))
          setCity(cityKey(target))
        }
      } catch {
        if (!controller.signal.aborted) setFailed(true)
      }
    }
    void load()
    return () => controller.abort()
  }, [attempt, focus])

  const filtered = (entries ?? []).filter((entry) =>
    (view === "world" || isChinaPlace(entry.place.country)) && (type === "all" || entry.type === type),
  )
  const regions = view === "china"
    ? groupEntries(filtered, ({ place }) => place.province, (name) => name)
    : groupEntries(filtered, worldRegion, countryName)
  const selectedRegion = regions.find(({ id }) => id === region)
  const cities = groupEntries(
    selectedRegion?.entries ?? [],
    cityKey,
    (_, entry) => entry.place.city,
  )
  const cityNames = new Map<string, number>()
  for (const group of cities) cityNames.set(group.name, (cityNames.get(group.name) ?? 0) + 1)
  for (const group of cities) {
    const province = group.entries[0].place.province
    if ((cityNames.get(group.name) ?? 0) > 1 && province) group.name = `${group.name} · ${province}`
  }
  const selectedCity = cities.find(({ id }) => id === city)
  const groups = selectedRegion ? cities : regions
  const pins: AtlasPin[] = selectedCity
    ? selectedCity.entries.map((entry) => ({
      ...entry.place, id: `${entry.type}:${entry.id}`, label: `查看${entry.type === "travel" ? "旅行" : "照片"}：${entry.title}`, href: placeEntryHref(entry), kind: entry.type, focused: focus === `${entry.type}:${entry.id}`,
    }))
    : groups.map((group) => ({
      ...group.entries[0].place, id: group.id, count: group.entries.length,
      shortLabel: group.name, label: `${group.name}，${group.entries.length} 条记录`,
    }))
  const bounds = selectedCity ? focusBounds(selectedCity.entries.map(({ place }) => place), 1.6, 1)
    : selectedRegion ? regionBounds(shapes.data, view, selectedRegion.id, selectedRegion.entries.map(({ place }) => place))
    : overviewBounds[view]

  function switchView(nextView: MapView) {
    setView(nextView)
    setRegion("")
    setCity("")
  }

  function pickGroup(id: string) {
    if (selectedRegion) setCity(id)
    else { setRegion(id); setCity("") }
  }

  const overview = view === "world" ? "世界地图" : "中国地图"
  const heading = selectedCity?.name ?? selectedRegion?.name ?? (view === "world" ? "国家和地区" : "省级地区")
  const count = selectedCity?.entries.length ?? selectedRegion?.entries.length ?? filtered.length

  return (
    <div className="atlas">
      <div className="atlas-toolbar">
        <div className="atlas-views" aria-label="地图范围">
          <button type="button" aria-pressed={view === "world"} onClick={() => switchView("world")}>世界地图</button>
          <button type="button" aria-pressed={view === "china"} onClick={() => switchView("china")}>中国地图</button>
        </div>
        <label className="atlas-type-filter">记录类型
          <select value={type} onChange={(event) => { setType(event.target.value); setRegion(""); setCity("") }}>
            <option value="all">全部</option><option value="travel">旅行</option><option value="photo">照片</option>
          </select>
        </label>
      </div>

      <nav className="atlas-crumbs" aria-label="地图层级">
        {selectedRegion ? <button type="button" onClick={() => { setRegion(""); setCity("") }}>{overview}</button> : <span aria-current="page">{overview}</span>}
        {selectedRegion && <><span aria-hidden="true">/</span>
          {selectedCity ? <button type="button" onClick={() => setCity("")}>{selectedRegion.name}</button> : <span aria-current="page">{selectedRegion.name}</span>}
        </>}
        {selectedCity && <><span aria-hidden="true">/</span><span aria-current="page">{selectedCity.name}</span></>}
      </nav>

      <div className="atlas-layout">
        <div>
          <GeoSurface shapes={shapes.data} view={view} bounds={bounds} pins={pins}
            selectedRegion={selectedRegion?.id} onPin={(pin) => pickGroup(pin.id)}
            label={`${heading}地图`} />
          {shapes.failed && <p className="atlas-status" role="status">地图底图加载失败。<button type="button" onClick={shapes.retry}>重试</button></p>}
          <p className="atlas-attribution">底图 <a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a> · <a href="https://www.geoboundaries.org/" target="_blank" rel="noreferrer">geoBoundaries</a></p>
        </div>
        <aside className="atlas-index" aria-label={heading} aria-busy={!entries && !failed}>
          <div className="atlas-index-heading"><h2 className="yearbook-display">{heading}</h2><span>{count} 条记录</span></div>
          {failed && <p className="atlas-status" role="alert">足迹加载失败。<button type="button" onClick={() => { setFailed(false); setAttempt((n) => n + 1) }}>重试</button></p>}
          {!entries && !failed && <p className="atlas-status" role="status">正在加载足迹…</p>}
          {entries && !count && <p className="atlas-status">此范围暂无标记。可到旅行日记或摄影相册补记地点。</p>}
          {selectedCity ? (
            <ul className="atlas-list">
              {selectedCity.entries.map((entry) => {
                const Icon = entry.type === "travel" ? MapPin : Camera
                return (
                  <li key={`${entry.type}:${entry.id}`} data-focused={focus === `${entry.type}:${entry.id}` || undefined}>
                    <Link href={placeEntryHref(entry)}>
                      <Icon size={18} aria-hidden="true" />
                      <div><strong>{entry.title}</strong><small>{dateFormat.format(new Date(entry.date))} · {placeName(entry.place)}</small></div>
                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <ul className="atlas-list">
              {groups.map((group) => (
                <li key={group.id}>
                  <button type="button" onClick={() => pickGroup(group.id)}>
                    <MapPin size={17} aria-hidden="true" /><strong>{group.name}</strong><small>{group.entries.length} 条</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  )
}
