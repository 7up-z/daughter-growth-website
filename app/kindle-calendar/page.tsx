"use client"

import { useState, useEffect, useCallback } from "react"
import Head from "next/head"

interface WeatherData {
  temp: number
  condition: string
  humidity: number
  windSpeed: number
  updateTime: string
}

interface LunarDate {
  year: string
  month: string
  day: string
  zodiac: string
}

const cities = [
  { name: "北京", code: "Beijing", lat: 39.9042, lon: 116.4074 },
  { name: "上海", code: "Shanghai", lat: 31.2304, lon: 121.4737 },
  { name: "广州", code: "Guangzhou", lat: 23.1291, lon: 113.2644 },
  { name: "深圳", code: "Shenzhen", lat: 22.5431, lon: 114.0579 },
  { name: "杭州", code: "Hangzhou", lat: 30.2741, lon: 120.1551 },
  { name: "成都", code: "Chengdu", lat: 30.5728, lon: 104.0668 },
  { name: "武汉", code: "Wuhan", lat: 30.5928, lon: 114.3055 },
  { name: "西安", code: "Xi'an", lat: 34.3416, lon: 108.9398 },
  { name: "南京", code: "Nanjing", lat: 32.0603, lon: 118.7969 },
  { name: "重庆", code: "Chongqing", lat: 29.5630, lon: 106.5516 },
]

// 农历数据表（1900-2100年）
const lunarInfo = [
  0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
  0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
  0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
  0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
  0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
  0x06ca0,0x0b550,0x15355,0x04da0,0x0a5d0,0x14573,0x052d0,0x0a9a8,0x0e950,0x06aa0,
  0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
  0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b5a0,0x195a6,
  0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
  0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
  0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
  0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
  0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
  0x05aa0,0x076a3,0x096d0,0x04bd7,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
  0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0
]

const Gan = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"]
const Zhi = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"]
const Animals = ["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"]
const lunarMonth = ["正","二","三","四","五","六","七","八","九","十","冬","腊"]
const lunarDay = ["初一","初二","初三","初四","初五","初六","初七","初八","初九","初十",
  "十一","十二","十三","十四","十五","十六","十七","十八","十九","二十",
  "廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"]

// 计算农历日期
function getLunarDate(date: Date): LunarDate {
  const baseDate = new Date(1900, 0, 31)
  const offset = Math.floor((date.getTime() - baseDate.getTime()) / 86400000)
  
  let year = 1900
  let daysInYear = 0
  let tempOffset = offset
  
  for (year = 1900; year < 2100 && tempOffset > 0; year++) {
    daysInYear = lYearDays(year)
    tempOffset -= daysInYear
  }
  
  if (tempOffset < 0) {
    tempOffset += daysInYear
    year--
  }
  
  const lunarYear = year
  const leapMonth = leapMonthOfYear(lunarYear)
  let isLeap = false
  let month = 1
  let daysInMonth = 0
  
  for (month = 1; month < 13 && tempOffset > 0; month++) {
    if (leapMonth > 0 && month === leapMonth + 1 && !isLeap) {
      month--
      isLeap = true
      daysInMonth = leapDays(lunarYear)
    } else {
      daysInMonth = monthDays(lunarYear, month)
    }
    
    if (isLeap && month === leapMonth + 1) {
      isLeap = false
    }
    
    tempOffset -= daysInMonth
  }
  
  if (tempOffset === 0 && leapMonth > 0 && month === leapMonth + 1) {
    if (isLeap) {
      isLeap = false
    } else {
      isLeap = true
      month--
    }
  }
  
  if (tempOffset < 0) {
    tempOffset += daysInMonth
    month--
  }
  
  const lunarMonth = month
  const lunarDay = tempOffset + 1
  
  const yearGan = Gan[(lunarYear - 4) % 10]
  const yearZhi = Zhi[(lunarYear - 4) % 12]
  const animal = Animals[(lunarYear - 4) % 12]
  
  return {
    year: `${yearGan}${yearZhi}`,
    month: (isLeap ? "闰" : "") + lunarMonthOf(lunarMonth),
    day: lunarDayOf(lunarDay),
    zodiac: animal
  }
}

function lYearDays(y: number): number {
  let i, sum = 348
  for (i = 0x8000; i > 0x8; i >>= 1) {
    sum += (lunarInfo[y - 1900] & i) ? 1 : 0
  }
  return sum + leapDays(y)
}

function leapDays(y: number): number {
  if (leapMonthOfYear(y)) {
    return (lunarInfo[y - 1900] & 0x10000) ? 30 : 29
  }
  return 0
}

function leapMonthOfYear(y: number): number {
  return lunarInfo[y - 1900] & 0xf
}

function monthDays(y: number, m: number): number {
  return (lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29
}

function lunarMonthOf(m: number): string {
  return ["正","二","三","四","五","六","七","八","九","十","冬","腊"][m - 1]
}

function lunarDayOf(d: number): string {
  return lunarDay[d - 1]
}

// 获取真实天气数据（使用 Open-Meteo API，免费无需密钥）
async function fetchRealWeather(lat: number, lon: number): Promise<WeatherData> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m,wind_speed_10m&timezone=auto`
    )
    
    if (!response.ok) {
      throw new Error("天气数据获取失败")
    }
    
    const data = await response.json()
    const current = data.current_weather
    
    // 获取当前小时的湿度和风速
    const currentHour = new Date().getHours()
    const humidity = data.hourly.relative_humidity_2m[currentHour] || 60
    const windSpeed = Math.round((data.hourly.wind_speed_10m[currentHour] || 5) / 2) // 转换为风力等级
    
    // 天气代码转换
    const weatherCode = current.weathercode
    let condition = "晴朗"
    
    if (weatherCode <= 1) condition = "晴朗"
    else if (weatherCode <= 3) condition = "多云"
    else if (weatherCode <= 48) condition = "阴天"
    else if (weatherCode <= 67) condition = "小雨"
    else if (weatherCode <= 77) condition = "中雨"
    else if (weatherCode <= 86) condition = "雪"
    else condition = "大雨"
    
    return {
      temp: Math.round(current.temperature),
      condition,
      humidity,
      windSpeed: Math.min(windSpeed, 12),
      updateTime: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
    }
  } catch (error) {
    console.error("获取天气失败:", error)
    // 返回默认数据
    return {
      temp: 22,
      condition: "晴朗",
      humidity: 60,
      windSpeed: 2,
      updateTime: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
    }
  }
}

export default function KindleCalendarPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedCity, setSelectedCity] = useState(cities[0])
  const [weather, setWeather] = useState<WeatherData>({
    temp: 22,
    condition: "晴朗",
    humidity: 60,
    windSpeed: 2,
    updateTime: "--:--"
  })
  const [showCitySelect, setShowCitySelect] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lunarDate, setLunarDate] = useState<LunarDate>(getLunarDate(new Date()))

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now)
      setLunarDate(getLunarDate(now))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // 更新天气
  const updateWeather = useCallback(async () => {
    setLoading(true)
    const weatherData = await fetchRealWeather(selectedCity.lat, selectedCity.lon)
    setWeather(weatherData)
    setLoading(false)
  }, [selectedCity])

  // 初始加载和定时刷新天气
  useEffect(() => {
    updateWeather()
    
    // 每30分钟自动刷新
    const weatherTimer = setInterval(updateWeather, 30 * 60 * 1000)
    
    return () => clearInterval(weatherTimer)
  }, [updateWeather])

  // 城市改变时更新天气
  useEffect(() => {
    updateWeather()
  }, [selectedCity, updateWeather])

  // 获取日历数据
  const getCalendarDays = () => {
    const year = currentTime.getFullYear()
    const month = currentTime.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const days: (number | null)[] = []
    
    // 填充空白
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    
    // 填充日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    
    return days
  }

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"]
  const calendarDays = getCalendarDays()
  const today = currentTime.getDate()
  const currentMonth = currentTime.getMonth()
  const currentYear = currentTime.getFullYear()

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

  // 格式化日期
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })
  }

  // 获取某天的农历
  const getDayLunar = (day: number) => {
    if (!day) return ""
    const date = new Date(currentYear, currentMonth, day)
    const lunar = getLunarDate(date)
    return lunar.day
  }

  return (
    <>
      <Head>
        <title>日历时钟 - Kindle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      
      <div className="min-h-screen bg-white text-black font-serif select-none">
        {/* Kindle 优化容器 */}
        <div className="max-w-[1024px] mx-auto p-6">
          
          {/* 顶部：城市选择和天气 */}
          <header className="flex justify-between items-start mb-6 border-b-2 border-black pb-4">
            <div className="relative">
              <button
                onClick={() => setShowCitySelect(!showCitySelect)}
                className="text-4xl font-bold hover:underline focus:outline-none"
              >
                {selectedCity.name}
                <span className="text-xl ml-2">▼</span>
              </button>
              
              {showCitySelect && (
                <div className="absolute z-50 bg-white border-2 border-black mt-2 max-h-48 overflow-y-auto shadow-lg">
                  {cities.map((city) => (
                    <button
                      key={city.code}
                      onClick={() => {
                        setSelectedCity(city)
                        setShowCitySelect(false)
                      }}
                      className="block w-full text-left px-6 py-3 hover:bg-gray-100 text-xl border-b border-gray-200 last:border-0"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* 天气信息 */}
            <div className="text-right">
              <div className="flex items-center justify-end gap-4">
                <div className="text-5xl font-bold">{weather.temp}°C</div>
                <button
                  onClick={updateWeather}
                  disabled={loading}
                  className="px-3 py-1 border-2 border-black text-sm hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                >
                  {loading ? "刷新中..." : "刷新"}
                </button>
              </div>
              <div className="text-2xl mt-1">{weather.condition}</div>
              <div className="text-base mt-2 text-gray-600">
                湿度 {weather.humidity}% | 风力 {weather.windSpeed}级
              </div>
              <div className="text-sm text-gray-400 mt-1">
                更新于 {weather.updateTime}
              </div>
            </div>
          </header>

          {/* 中间：大时钟 */}
          <section className="text-center py-6 mb-6">
            <div className="text-[100px] font-bold leading-none tracking-wider font-mono">
              {formatTime(currentTime)}
            </div>
            <div className="text-2xl mt-4 text-gray-700">
              {formatDate(currentTime)}
            </div>
            <div className="text-xl mt-2 text-gray-600">
              {lunarDate.year}年 {lunarDate.month}月{lunarDate.day} · {lunarDate.zodiac}年
            </div>
          </section>

          {/* 底部：月历 */}
          <section className="border-2 border-black">
            {/* 月历标题 */}
            <div className="flex justify-between items-center p-4 border-b-2 border-black bg-gray-50">
              <h2 className="text-2xl font-bold">
                {currentYear}年{currentMonth + 1}月
              </h2>
              <div className="text-lg text-gray-600">
                {lunarDate.year}年 {lunarDate.month}月
              </div>
            </div>
            
            {/* 星期标题 */}
            <div className="grid grid-cols-7 border-b-2 border-black">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center py-3 text-lg font-bold border-r border-black last:border-r-0 bg-gray-100"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* 日期网格 */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const lunarDay = getDayLunar(day || 0)
                const isToday = day === today
                
                return (
                  <div
                    key={index}
                    className={`
                      aspect-square flex flex-col items-center justify-center
                      border-r border-b border-black last:border-r-0
                      ${day === null ? 'bg-gray-50' : 'bg-white'}
                      ${isToday ? 'bg-black text-white' : ''}
                    `}
                  >
                    {day && (
                      <>
                        <span className={`text-2xl font-bold ${isToday ? 'text-white' : ''}`}>
                          {day}
                        </span>
                        <span className={`text-xs mt-1 ${isToday ? 'text-gray-300' : 'text-gray-500'}`}>
                          {lunarDay}
                        </span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* 底部信息 */}
          <footer className="mt-6 text-center text-sm text-gray-500 border-t border-gray-300 pt-4">
            <p>Kindle Paperwhite 优化显示 | 数据来源于 Open-Meteo</p>
            <p className="mt-1">当前城市: {selectedCity.name} | 上次更新: {weather.updateTime}</p>
          </footer>
        </div>
      </div>
    </>
  )
}
