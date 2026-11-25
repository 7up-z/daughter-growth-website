"use client"

import { useEffect, useRef, useState, type MouseEvent } from "react"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { useTheme } from "@/components/providers/theme-provider"

export type Coordinates = { latitude: number; longitude: number }
type Ring = [longitude: number, latitude: number][]
export type Shape = [region: string, polygons: Ring[][]]
export type Bounds = [west: number, south: number, east: number, north: number]
export type MapView = "world" | "china"
export type AtlasShapes = { world: Shape[]; china: Shape[] }

export type AtlasPin = Coordinates & {
  id: string
  label: string
  shortLabel?: string
  count?: number
  href?: string
}

const mapWidth = 1000
const mapHeight = 540
export const overviewBounds: Record<MapView, Bounds> = {
  world: [-180, -60, 180, 82],
  china: [72, 14, 137, 55],
}

let shapesRequest: Promise<AtlasShapes> | undefined

async function fetchShape(name: MapView): Promise<Shape[]> {
  const response = await fetch(`/maps/${name}.json`)
  if (!response.ok) throw new Error("地图载入失败")
  return response.json()
}

export function useAtlasShapes() {
  const [data, setData] = useState<AtlasShapes | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    shapesRequest ??= Promise.all([fetchShape("world"), fetchShape("china")])
      .then(([world, china]) => ({ world, china }))
      .catch((error) => {
        shapesRequest = undefined
        throw error
      })
    shapesRequest.then((shapes) => { if (active) setData(shapes) })
      .catch(() => { if (active) setFailed(true) })
    return () => { active = false }
  }, [attempt])

  return {
    data, failed,
    retry: () => { setFailed(false); setAttempt((current) => current + 1) },
  }
}

export function focusBounds(points: Coordinates[], longitudeSpan: number, latitudeSpan: number): Bounds {
  if (!points.length) return overviewBounds.world
  let west = Infinity
  let east = -Infinity
  let south = Infinity
  let north = -Infinity
  for (const { longitude, latitude } of points) {
    west = Math.min(west, longitude)
    east = Math.max(east, longitude)
    south = Math.min(south, latitude)
    north = Math.max(north, latitude)
  }
  const midX = (west + east) / 2
  const midY = (south + north) / 2
  const x = Math.max(longitudeSpan / 2, (east - west) * .57)
  const y = Math.max(latitudeSpan / 2, (north - south) * .62)
  return [midX - x, midY - y, midX + x, midY + y]
}

export function regionBounds(shapes: AtlasShapes | null, view: MapView, region: string, points: Coordinates[]) {
  const outline = view === "world" && region === "CN" ? shapes?.china
    : shapes?.[view].filter(([name]) => name === region)
  const corners: Coordinates[] = []
  for (const [, polygons] of outline ?? []) {
    for (const polygon of polygons) {
      for (const [longitude, latitude] of polygon[0] ?? []) corners.push({ longitude, latitude })
    }
  }
  const bounds = focusBounds([...corners, ...points], 1.2, .75)
  return bounds[2] - bounds[0] < 140 ? bounds : focusBounds(points, 8, 5)
}

function projection([west, south, east, north]: Bounds) {
  const midLatitude = (north + south) / 2
  const midLongitude = (east + west) / 2
  const longitudeFactor = Math.max(.3, Math.cos(midLatitude * Math.PI / 180))
  const scale = Math.min((mapWidth - 68) / ((east - west) * longitudeFactor), (mapHeight - 58) / (north - south))
  return {
    point: (latitude: number, longitude: number) => [
      mapWidth / 2 + (longitude - midLongitude) * scale * longitudeFactor,
      mapHeight / 2 - (latitude - midLatitude) * scale,
    ],
    coordinates: (x: number, y: number) => ({
      latitude: +(midLatitude + (mapHeight / 2 - y) / scale).toFixed(6),
      longitude: +(midLongitude + (x - mapWidth / 2) / (scale * longitudeFactor)).toFixed(6),
    }),
  }
}

function positionPins(pins: AtlasPin[], bounds: Bounds, separation: number) {
  const { point } = projection(bounds)
  const positions: [number, number][] = []
  return pins.map((pin) => {
    const [anchorX, anchorY] = point(pin.latitude, pin.longitude)
    const offset = (x: number, y: number): [number, number] => [
      Math.min(mapWidth - 36, Math.max(36, x)), Math.min(mapHeight - 28, Math.max(29, y)),
    ]
    let location = offset(anchorX, anchorY)
    // Neighbouring points spread outward around their actual position, with a short leader line.
    for (let step = 0; step < 100 && positions.some(([x, y]) => Math.hypot(x - location[0], y - location[1]) < separation); step++) {
      const angle = step * 2.39996
      const distance = separation * .58 * Math.sqrt(step + 1)
      location = offset(anchorX + Math.cos(angle) * distance, anchorY + Math.sin(angle) * distance)
    }
    positions.push(location)
    return { pin, anchorX, anchorY, x: location[0], y: location[1] }
  })
}

export function GeoSurface({
  shapes, view, bounds, pins = [], selectedRegion, onPin, onPick, label,
}: {
  shapes: AtlasShapes | null
  view: MapView
  bounds: Bounds
  pins?: AtlasPin[]
  selectedRegion?: string
  onPin?: (pin: AtlasPin) => void
  onPick?: (coordinates: Coordinates) => void
  label: string
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const [canvasWidth, setCanvasWidth] = useState(mapWidth)
  const positioned = positionPins(pins, bounds, Math.max(42, 29 * mapWidth / canvasWidth))

  useEffect(() => {
    const element = canvas.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setCanvasWidth(entry.contentRect.width)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const element = canvas.current
    const ctx = element?.getContext("2d")
    if (!element || !ctx) return

    const styles = getComputedStyle(element)
    const draw = projection(bounds).point
    ctx.clearRect(0, 0, mapWidth, mapHeight)

    function drawLayer(layer: Shape[], china: boolean) {
      if (!ctx) return
      ctx.lineJoin = "round"
      for (const [name, polygons] of layer) {
        const isSelected = selectedRegion === (china && view === "world" ? "CN" : name)
        ctx.fillStyle = styles.getPropertyValue(isSelected ? "--atlas-selected" : "--atlas-land")
        ctx.strokeStyle = styles.getPropertyValue(china && view === "world" ? "--atlas-land" : "--atlas-border")
        ctx.lineWidth = china && view === "world" ? .25 : .85
        for (const polygon of polygons) {
          ctx.beginPath()
          for (const ring of polygon) {
            ring.forEach(([lon, lat], index) => {
              const [x, y] = draw(lat, lon)
              if (index === 0) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
            })
            ctx.closePath()
          }
          ctx.fill("evenodd")
          ctx.stroke()
        }
      }
    }

    if (shapes) {
      if (view === "world") drawLayer(shapes.world, false)
      drawLayer(shapes.china, true)
    }

    ctx.strokeStyle = styles.getPropertyValue("--atlas-grid")
    ctx.lineWidth = .55
    const span = bounds[2] - bounds[0]
    const grid = span > 170 ? 30 : span > 55 ? 10 : span > 15 ? 5 : span > 3 ? 1 : .25
    const [west, south, east, north] = bounds
    ctx.beginPath()
    for (let lon = Math.ceil(west / grid) * grid; lon <= east; lon += grid) {
      const [x] = draw(0, lon)
      ctx.moveTo(x, 0)
      ctx.lineTo(x, mapHeight)
    }
    for (let lat = Math.ceil(south / grid) * grid; lat <= north; lat += grid) {
      const [, y] = draw(lat, 0)
      ctx.moveTo(0, y)
      ctx.lineTo(mapWidth, y)
    }
    ctx.stroke()


    ctx.strokeStyle = styles.getPropertyValue("--yearbook-warm")
    ctx.lineWidth = .9
    for (const { x, y, anchorX, anchorY } of positioned) {
      if (Math.hypot(x - anchorX, y - anchorY) < 4) continue
      ctx.beginPath()
      ctx.moveTo(anchorX, anchorY)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }, [shapes, view, bounds, selectedRegion, theme, positioned])

  function pick(event: MouseEvent<HTMLCanvasElement>) {
    if (!onPick) return
    const box = event.currentTarget.getBoundingClientRect()
    const point = projection(bounds).coordinates(
      (event.clientX - box.left) / box.width * mapWidth,
      (event.clientY - box.top) / box.height * mapHeight,
    )
    if (Math.abs(point.latitude) <= 85 && Math.abs(point.longitude) <= 180) onPick(point)
  }

  return (
    <div className="atlas-surface" role="group" aria-label={label}>
      <canvas width={mapWidth} height={mapHeight} ref={canvas} onClick={onPick ? pick : undefined}
        aria-hidden="true" className={onPick ? "atlas-selectable" : undefined} />
      {positioned.map(({ pin, x, y }) => {
        const style = { left: `${x / mapWidth * 100}%`, top: `${y / mapHeight * 100}%` }
        const content = pin.count === undefined ? <MapPin size={17} aria-hidden="true" /> : <span>{pin.count}</span>
        const marker = <><span className="atlas-pin-dot">{content}</span>{pin.shortLabel && <span className="atlas-pin-label">{pin.shortLabel}</span>}</>
        const shared = { className: "atlas-pin", style, title: pin.label, "aria-label": pin.label }
        if (pin.href) return <Link key={pin.id} href={pin.href} {...shared}>{marker}</Link>
        if (onPin) return <button key={pin.id} type="button" {...shared} onClick={() => onPin(pin)}>{marker}</button>
        return <span key={pin.id} className="atlas-pin atlas-pin-preview" style={style} aria-hidden="true">{marker}</span>
      })}
    </div>
  )
}
