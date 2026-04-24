"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, ChevronLeft, Clock, Calendar, Cloud, MapPin, RefreshCw } from "lucide-react"

// 城市列表
const cities = [
  { id: "beijing", name: "北京", lat: 39.9042, lon: 116.4074 },
  { id: "shanghai", name: "上海", lat: 31.2304, lon: 121.4737 },
  { id: "guangzhou", name: "广州", lat: 23.1291, lon: 113.2644 },
  { id: "shenzhen", name: "深圳", lat: 22.5431, lon: 114.0579 },
  { id: "hangzhou", name: "杭州", lat: 30.2741, lon: 120.1551 },
  { id: "chengdu", name: "成都", lat: 30.5728, lon: 104.0668 },
  { id: "wuhan", name: "武汉", lat: 30.5928, lon: 114.3055 },
  { id: "xian", name: "西安", lat: 34.2658, lon: 108.9541 },
  { id: "nanjing", name: "南京", lat: 32.0603, lon: 118.7969 },
  { id: "tianjin", name: "天津", lat: 39.3434, lon: 117.3616 },
]

// 星期名称
const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

export default function KindleClockPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // 状态
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedCity, setSelectedCity] = useState("beijing")
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>("--")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 获取天气
  const fetchWeather = async () => {
    setLoading(true)
    try {
      // 这里使用和风天气 API
      // 实际使用时需要替换为您的 API Key
      const city = cities.find(c => c.id === selectedCity)
      if (!city) return

      // 模拟天气数据（实际部署时替换为真实 API 调用）
      // const response = await fetch(
      //   `https://devapi.qweather.com/v7/weather/now?location=${city.lon},${city.lat}&key=YOUR_API_KEY`
      // )
      // const data = await response.json()
      
      // 模拟数据
      const mockData = {
        temp: Math.floor(Math.random() * 15) + 15,
        text: ['晴', '多云', '阴', '小雨', '中雨'][Math.floor(Math.random() * 5)],
        humidity: Math.floor(Math.random() * 30) + 40,
        windScale: Math.floor(Math.random() * 3) + 1,
        windDir: ['东北', '东南', '西北', '西南'][Math.floor(Math.random() * 4)],
      }
      
      setWeather(mockData)
      setLastUpdate(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
    } catch (error) {
      console.error("获取天气失败:", error)
    } finally {
      setLoading(false)
    }
  }

  // 城市切换时更新天气
  useEffect(() => {
    fetchWeather()
    // 每30分钟自动刷新
    const timer = setInterval(fetchWeather, 30 * 60 * 1000)
    return () => clearInterval(timer)
  }, [selectedCity])

  // 生成月历数据
  const generateCalendar = () => {
    const year = currentTime.getFullYear()
    const month = currentTime.getMonth()
    const today = currentTime.getDate()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startWeekday = firstDay.getDay()
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    
    const days: { date: number; isToday: boolean; isOtherMonth: boolean }[] = []
    
    // 上个月的日期
    for (let i = startWeekday - 1; i >= 0; i--) {
      days.push({ date: prevMonthLastDay - i, isToday: false, isOtherMonth: true })
    }
    
    // 本月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: i, isToday: i === today, isOtherMonth: false })
    }
    
    // 下个月的日期
    const remainingCells = 42 - days.length
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ date: i, isToday: false, isOtherMonth: true })
    }
    
    return { year, month: month + 1, days }
  }

  const calendar = generateCalendar()
  const currentCity = cities.find(c => c.id === selectedCity)

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--theme-background)]">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 border-4 border-[var(--theme-primary)] mx-auto mb-4" />
          </div>
          <p className="text-[var(--theme-text-muted)]">正在加载...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--theme-background)]">
      {/* 复古导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-[var(--theme-secondary)] transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 border-2 border-[var(--theme-primary)] flex items-center justify-center bg-[var(--theme-surface)]">
                  <Heart className="w-4 h-4 text-[var(--theme-primary)]" />
                </div>
                <span className="font-bold hidden sm:block">成长记录</span>
              </Link>
            </div>
            <h1 className="text-lg font-semibold tracking-wide">日历时钟</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="pt-20 pb-8">
        <div className="max-w-5xl mx-auto px-6">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <span className="vintage-subtitle mb-2 block">Kindle Edition</span>
            <h1 className="vintage-title text-4xl">日历时钟</h1>
            <div className="vintage-divider mx-auto mt-4" />
            <p className="text-[var(--theme-text-muted)] mt-4">
              专为 Kindle Paperwhite 墨水屏优化设计
            </p>
          </div>

          {/* Kindle 预览区域 */}
          <div className="bg-white border-4 border-[var(--theme-dark)] shadow-2xl overflow-hidden">
            {/* Kindle 屏幕区域 - 模拟 1024x758 比例 */}
            <div className="relative" style={{ paddingBottom: '74%' }}>
              <div className="absolute inset-0 flex flex-col">
                {/* 顶部时间区域 */}
                <div className="flex-shrink-0 border-b-4 border-[var(--theme-dark)] p-6 text-center bg-white">
                  <div className="flex items-center justify-center space-x-4 mb-2">
                    <Clock className="w-8 h-8 text-[var(--theme-primary)]" />
                    <span className="text-6xl font-bold tracking-wider text-[var(--theme-dark)]">
                      {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-xl text-[var(--theme-text-muted)]">
                    <Calendar className="w-5 h-5" />
                    <span>
                      {currentTime.getFullYear()}年{currentTime.getMonth() + 1}月{currentTime.getDate()}日 {weekdays[currentTime.getDay()]}
                    </span>
                  </div>
                </div>

                {/* 中间内容区域 */}
                <div className="flex-1 flex border-b-4 border-[var(--theme-dark)] min-h-0">
                  {/* 左侧月历 */}
                  <div className="flex-1 border-r-4 border-[var(--theme-dark)] p-6 overflow-auto">
                    <div className="text-center text-2xl font-bold mb-4 pb-2 border-b-2 border-[var(--theme-dark)]">
                      {calendar.year}年{calendar.month}月
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                        <div key={day} className="text-center font-bold py-2 border-b border-[var(--theme-border)]">
                          {day}
                        </div>
                      ))}
                      {calendar.days.map((day, idx) => (
                        <div
                          key={idx}
                          className={`
                            text-center py-3 text-lg border
                            ${day.isToday 
                              ? 'bg-[var(--theme-dark)] text-white font-bold border-2 border-[var(--theme-dark)]' 
                              : day.isOtherMonth 
                                ? 'text-[var(--theme-text-muted)] border-[var(--theme-border)]' 
                                : 'border-[var(--theme-border)] hover:bg-[var(--theme-secondary)]'
                            }
                          `}
                        >
                          {day.date}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 右侧天气 */}
                  <div className="w-80 p-6 flex flex-col">
                    {/* 城市选择 */}
                    <div className="mb-6 pb-4 border-b-2 border-[var(--theme-dark)]">
                      <label className="block text-sm font-bold mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        选择城市
                      </label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full p-3 border-2 border-[var(--theme-dark)] bg-white font-medium"
                      >
                        {cities.map(city => (
                          <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* 天气信息 */}
                    <div className="flex-1 flex flex-col justify-around">
                      {loading ? (
                        <div className="text-center py-8 text-[var(--theme-text-muted)]">
                          加载中...
                        </div>
                      ) : weather ? (
                        <>
                          <div className="text-center py-4 border-b border-[var(--theme-border)]">
                            <div className="text-sm text-[var(--theme-text-muted)] mb-1">当前温度</div>
                            <div className="text-5xl font-bold text-[var(--theme-dark)]">{weather.temp}°C</div>
                          </div>
                          <div className="py-4 border-b border-[var(--theme-border)]">
                            <div className="text-sm text-[var(--theme-text-muted)] mb-1">天气状况</div>
                            <div className="flex items-center space-x-2">
                              <Cloud className="w-6 h-6 text-[var(--theme-primary)]" />
                              <span className="text-2xl font-medium">{weather.text}</span>
                            </div>
                          </div>
                          <div className="py-4 border-b border-[var(--theme-border)]">
                            <div className="text-sm text-[var(--theme-text-muted)] mb-1">湿度</div>
                            <div className="text-2xl font-medium">{weather.humidity}%</div>
                          </div>
                          <div className="py-4">
                            <div className="text-sm text-[var(--theme-text-muted)] mb-1">风力</div>
                            <div className="text-2xl font-medium">{weather.windDir}风 {weather.windScale}级</div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-[var(--theme-text-muted)]">
                          暂无天气数据
                        </div>
                      )}
                    </div>

                    {/* 刷新按钮 */}
                    <button
                      onClick={fetchWeather}
                      disabled={loading}
                      className="mt-4 w-full py-3 border-2 border-[var(--theme-dark)] bg-white hover:bg-[var(--theme-dark)] hover:text-white transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      <span>刷新天气</span>
                    </button>
                  </div>
                </div>

                {/* 底部更新时间 */}
                <div className="flex-shrink-0 px-6 py-3 flex justify-between items-center text-sm text-[var(--theme-text-muted)] bg-white border-t border-[var(--theme-border)]">
                  <span>最后更新: {lastUpdate}</span>
                  <span>Kindle Paperwhite 优化版</span>
                </div>
              </div>
            </div>
          </div>

          {/* 使用说明 */}
          <div className="mt-8 bg-[var(--theme-surface)] border-2 border-[var(--theme-border)] p-6">
            <h3 className="text-xl font-bold mb-4">使用说明</h3>
            <div className="grid md:grid-cols-2 gap-6 text-[var(--theme-text-muted)]">
              <div>
                <h4 className="font-semibold text-[var(--theme-text)] mb-2">Kindle 使用步骤：</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>在 Kindle 浏览器中访问本页面</li>
                  <li>选择您所在的城市</li>
                  <li>天气数据每30分钟自动更新</li>
                  <li>时间实时同步显示</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--theme-text)] mb-2">优化特性：</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>高对比度黑白设计，适合墨水屏</li>
                  <li>清晰的大字体显示</li>
                  <li>简洁的界面布局</li>
                  <li>低刷新率优化</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
