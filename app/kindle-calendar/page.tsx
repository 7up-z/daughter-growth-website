"use client"

import { useState, useEffect } from "react"
import Head from "next/head"

interface WeatherData {
  temp: number
  condition: string
  humidity: number
  windSpeed: number
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

// 模拟天气数据（实际应用中应调用天气API）
const getMockWeather = (cityCode: string): WeatherData => {
  const conditions = ["晴朗", "多云", "阴天", "小雨", "中雨"]
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]
  return {
    temp: Math.floor(Math.random() * 15) + 15, // 15-30度
    condition: randomCondition,
    humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
    windSpeed: Math.floor(Math.random() * 10) + 1, // 1-10级
  }
}

export default function KindleCalendarPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedCity, setSelectedCity] = useState(cities[0])
  const [weather, setWeather] = useState<WeatherData>(getMockWeather(cities[0].code))
  const [showCitySelect, setShowCitySelect] = useState(false)

  // 更新时间和天气
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // 每30分钟更新一次天气
    const weatherTimer = setInterval(() => {
      setWeather(getMockWeather(selectedCity.code))
    }, 30 * 60 * 1000)

    return () => {
      clearInterval(timer)
      clearInterval(weatherTimer)
    }
  }, [selectedCity])

  // 城市改变时更新天气
  useEffect(() => {
    setWeather(getMockWeather(selectedCity.code))
  }, [selectedCity])

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

  // 获取农历（简化版，实际应使用农历库）
  const getLunarDate = () => {
    const lunarMonths = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"]
    const lunarDays = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
      "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
      "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"]
    
    // 简化计算，实际应使用专业农历库
    const day = currentTime.getDate()
    const month = currentTime.getMonth()
    return `农历${lunarMonths[month]}月${lunarDays[day - 1] || "初一"}`
  }

  return (
    <>
      <Head>
        <title>日历时钟 - Kindle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      
      <div className="min-h-screen bg-white text-black font-serif select-none">
        {/* Kindle 优化容器 - 1024x768 分辨率适配 */}
        <div className="max-w-[1024px] mx-auto p-8">
          
          {/* 顶部：城市选择和天气 */}
          <header className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
            <div>
              <button
                onClick={() => setShowCitySelect(!showCitySelect)}
                className="text-3xl font-bold hover:underline focus:outline-none"
              >
                {selectedCity.name}
                <span className="text-lg ml-2">▼</span>
              </button>
              
              {showCitySelect && (
                <div className="absolute z-50 bg-white border-2 border-black mt-2 max-h-48 overflow-y-auto">
                  {cities.map((city) => (
                    <button
                      key={city.code}
                      onClick={() => {
                        setSelectedCity(city)
                        setShowCitySelect(false)
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200 text-lg"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* 天气信息 */}
            <div className="text-right">
              <div className="text-4xl font-bold">{weather.temp}°C</div>
              <div className="text-xl">{weather.condition}</div>
              <div className="text-sm mt-1 text-gray-600">
                湿度 {weather.humidity}% | 风速 {weather.windSpeed}级
              </div>
            </div>
          </header>

          {/* 中间：大时钟 */}
          <section className="text-center py-8 mb-8">
            <div className="text-[120px] font-bold leading-none tracking-wider">
              {formatTime(currentTime)}
            </div>
            <div className="text-2xl mt-4 text-gray-600">
              {formatDate(currentTime)}
            </div>
            <div className="text-xl mt-2 text-gray-500">
              {getLunarDate()}
            </div>
          </section>

          {/* 底部：月历 */}
          <section className="border-2 border-black">
            {/* 月历标题 */}
            <div className="flex justify-between items-center p-4 border-b-2 border-black bg-gray-100">
              <h2 className="text-2xl font-bold">
                {currentYear}年{currentMonth + 1}月
              </h2>
              <div className="text-lg text-gray-600">
                {getLunarDate()}
              </div>
            </div>
            
            {/* 星期标题 */}
            <div className="grid grid-cols-7 border-b border-black">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center py-3 text-lg font-bold border-r border-black last:border-r-0 bg-gray-50"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* 日期网格 */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`
                    aspect-square flex items-center justify-center text-2xl
                    border-r border-b border-black last:border-r-0
                    ${day === null ? 'bg-gray-50' : 'bg-white'}
                    ${day === today ? 'bg-black text-white font-bold' : ''}
                  `}
                >
                  {day || ''}
                </div>
              ))}
            </div>
          </section>

          {/* 底部信息 */}
          <footer className="mt-8 text-center text-sm text-gray-500 border-t border-gray-300 pt-4">
            <p>Kindle Paperwhite 优化显示 | 自动刷新</p>
            <p className="mt-1">上次更新: {currentTime.toLocaleTimeString("zh-CN")}</p>
          </footer>
        </div>
      </div>
    </>
  )
}
