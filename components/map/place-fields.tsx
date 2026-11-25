"use client"

import { useEffect, useId, useState } from "react"
import { MapPin, Minus, Plus } from "lucide-react"
import { chinaProvinces, countryCodes, countryName, isChinaPlace, provinceForCountry, type PlaceDraft } from "@/lib/entry-place"
import { focusBounds, GeoSurface, overviewBounds, regionBounds, useAtlasShapes } from "./geo-surface"

type City = [name: string, province: string, latitude: number, longitude: number, aliases: string]
let citiesRequest: Promise<Record<string, City[]>> | undefined

const countries = countryCodes.map((code) => ({ code, name: countryName(code) }))
  .sort((a, b) => Number(b.code === "CN") - Number(a.code === "CN") || a.name.localeCompare(b.name, "zh"))

export function emptyPlace(label = ""): PlaceDraft {
  return { country: "CN", province: "", city: "", label, latitude: null, longitude: null }
}

function PinPicker({ value, onChange }: { value: PlaceDraft; onChange: (place: PlaceDraft) => void }) {
  const shapes = useAtlasShapes()
  const [zoom, setZoom] = useState(0)
  const view = isChinaPlace(value.country) ? "china" : "world"
  const point = value.latitude !== null && value.longitude !== null
    ? { latitude: value.latitude, longitude: value.longitude } : null
  const region = view === "china" ? value.province : value.country
  const outline = shapes.data?.[view].some(([name]) => name === region)
  const initialBounds = point ? focusBounds([point], 2.8, 1.6)
    : region && outline ? regionBounds(shapes.data, view, region, []) : overviewBounds[view]
  const [w, s, e, n] = initialBounds
  const scale = 1.75 ** zoom
  const pointBounds = focusBounds(
    [{ longitude: (w + e) / 2, latitude: (s + n) / 2 }], (e - w) / scale, (n - s) / scale,
  )

  return (
    <div className="place-picker">
      <div className="place-map-toolbar">
        <span>点选地图设置标记</span>
        <div>
          <button type="button" aria-label="缩小选点地图" disabled={zoom <= -2} onClick={() => setZoom(zoom - 1)}><Minus size={17} /></button>
          <button type="button" aria-label="放大选点地图" disabled={zoom >= 5} onClick={() => setZoom(zoom + 1)}><Plus size={17} /></button>
        </div>
      </div>
      <GeoSurface shapes={shapes.data} bounds={pointBounds} view={view} selectedRegion={region}
        pins={point ? [{ ...point, id: "selected", label: "所选位置" }] : []}
        onPick={(next) => onChange({ ...value, ...next })} label="地点选点地图" />
      {shapes.failed && <p className="atlas-status">底图加载失败。<button type="button" onClick={shapes.retry}>重试</button></p>}
      <p className="atlas-attribution">底图 Natural Earth · geoBoundaries</p>
    </div>
  )
}

export function PlaceFields({
  value, onChange, legacyLabel = "",
}: {
  value: PlaceDraft | null
  onChange: (place: PlaceDraft | null) => void
  legacyLabel?: string
}) {
  return (
    <fieldset className="place-field">
      <legend>地点记录 <small>选填</small></legend>
      {value ? <PlaceInputs value={value} onChange={onChange} /> : (
        <button className="place-link" type="button" onClick={() => onChange(emptyPlace(legacyLabel))}>
          <MapPin size={17} aria-hidden="true" /> 添加地点
        </button>
      )}
    </fieldset>
  )
}

function PlaceInputs({
  value, onChange,
}: {
  value: PlaceDraft
  onChange: (place: PlaceDraft | null) => void
}) {
  const cityListId = useId()
  const [cities, setCities] = useState<Record<string, City[]>>({})
  const [showCities, setShowCities] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showCoordinates, setShowCoordinates] = useState(false)

  useEffect(() => {
    let active = true
    citiesRequest ??= fetch("/maps/cities.json").then((response) => {
      if (!response.ok) throw new Error("城市索引加载失败")
      return response.json()
    }).catch((error) => {
      citiesRequest = undefined
      throw error
    })
    citiesRequest.then((data) => { if (active) setCities(data) }).catch(() => {})
    return () => { active = false }
  }, [])

  const search = value.city.trim().toLocaleLowerCase("zh-CN")
  const matching = (cities[value.country] ?? []).filter(([name, province, , , aliases]) => (
    (!isChinaPlace(value.country) || !value.province || value.province === province) &&
    (!search || name.toLocaleLowerCase("zh-CN").includes(search) || aliases.toLocaleLowerCase("zh-CN").includes(search))
  )).slice(0, 7)
  const hasPoint = value.latitude !== null && value.longitude !== null
  const automaticProvince = provinceForCountry(value.country)

  return (
    <>
      <div className="place-input-grid">
        <label>国家或地区
          <select aria-label="国家或地区" value={value.country} onChange={(event) => {
            const country = event.target.value
            onChange({ ...emptyPlace(value.label), country, province: provinceForCountry(country) })
            setShowCities(false)
          }}>
            {countries.map(({ code, name }) => <option key={code} value={code}>{name}</option>)}
          </select>
        </label>
        {value.country === "CN" ? (
          <label>省级地区
            <select aria-label="省级地区" required value={value.province} onChange={(event) => {
              onChange({ ...value, province: event.target.value, city: "", latitude: null, longitude: null })
              setShowCities(false)
            }}>
              <option value="">选择省级地区</option>
              {chinaProvinces.map((name) => <option key={name}>{name}</option>)}
            </select>
          </label>
        ) : !automaticProvince ? (
          <label>州或地区（选填）
            <input maxLength={60} value={value.province} onChange={(event) => onChange({ ...value, province: event.target.value })} />
          </label>
        ) : null}
        <div className="place-city-input" onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setShowCities(false)
        }}>
          <label>城市
            <input required autoComplete="off" maxLength={80} value={value.city} aria-controls={showCities && matching.length ? cityListId : undefined}
              onFocus={() => setShowCities(true)}
              onChange={(event) => {
                onChange({ ...value, city: event.target.value, latitude: null, longitude: null })
                setShowCities(true)
              }}
              placeholder="搜索或填写城市" />
          </label>
          {showCities && matching.length > 0 && (
            <ul id={cityListId} className="place-city-options" aria-label="候选城市">
              {matching.map(([city, province, latitude, longitude]) => (
                <li key={`${city}-${latitude}-${longitude}`}>
                  <button type="button" onClick={() => {
                    onChange({ ...value, city, province: province || value.province, latitude, longitude })
                    setShowCities(false)
                  }}><span>{city}</span>{province && <small>{province}</small>}</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <label>地点名称（选填）
          <input maxLength={100} value={value.label} onChange={(event) => onChange({ ...value, label: event.target.value })}
            placeholder="例如：公园或博物馆" />
        </label>
      </div>

      <div className="place-actions">
        <button type="button" className="place-link" aria-expanded={showMap} onClick={() => setShowMap(!showMap)}>
          <MapPin size={17} aria-hidden="true" /> {showMap ? "收起地图" : hasPoint ? "在地图上调整" : "在地图上选点"}
        </button>
        <button type="button" className="place-link" aria-expanded={showCoordinates} onClick={() => setShowCoordinates(!showCoordinates)}>
          {showCoordinates ? "收起经纬度" : "填写经纬度"}
        </button>
        <button type="button" className="place-link" onClick={() => onChange(null)}>移除地点</button>
      </div>
      <p className="place-hint" aria-live="polite">
        {hasPoint ? `已设置标记 · ${value.latitude?.toFixed(4)}, ${value.longitude?.toFixed(4)}`
          : "选中城市可使用市中心作为初始标记，也可在地图上点选。"}
      </p>
      {showMap && <PinPicker value={value} onChange={onChange} />}
      {showCoordinates && (
        <div className="place-input-grid place-coordinate-fields">
          <label>纬度
            <input type="number" min={-85} max={85} step="any" value={value.latitude ?? ""}
              onChange={(event) => onChange({ ...value, latitude: Number.isFinite(event.target.valueAsNumber) ? event.target.valueAsNumber : null })} />
          </label>
          <label>经度
            <input type="number" min={-180} max={180} step="any" value={value.longitude ?? ""}
              onChange={(event) => onChange({ ...value, longitude: Number.isFinite(event.target.valueAsNumber) ? event.target.valueAsNumber : null })} />
          </label>
        </div>
      )}
      <p className="atlas-attribution">城市参考 <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a></p>
    </>
  )
}
