import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://864d3fb04ba14d9d5d42e41c384636b7facc0781926b3c02687525bd14122efa:sk_1NA-nanmJqZSj0wuApqH_@db.prisma.io:5432/postgres?sslmode=require'
    }
  }
})

async function main() {
  try {
    // 查找用户 7up
    const user = await prisma.user.findUnique({
      where: { username: '7up' }
    })

    if (!user) {
      console.log('用户 7up 不存在')
      return
    }

    console.log('找到用户:', user.username)
    console.log('当前角色:', user.role)

    // 设置为管理员
    const updatedUser = await prisma.user.update({
      where: { username: '7up' },
      data: { role: 'admin' }
    })

    console.log('✅ 用户 7up 已成功设置为管理员')
    console.log('新角色:', updatedUser.role)
  } catch (error) {
    console.error('错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
