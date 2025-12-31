import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/admin-setup')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const users = await db.select().from(user).limit(1)
          if (users.length === 0) {
            return new Response('No users found', { status: 404 })
          }

          const firstUser = users[0]
          await db.update(user)
            .set({ role: 'admin' })
            .where(eq(user.id, firstUser.id))

          return new Response(`Successfully elevated ${firstUser.email} to admin. Please delete this route after use.`, { status: 200 })
        } catch (error: any) {
          return new Response(`Error: ${error.message}`, { status: 500 })
        }
      },
    }
  }
})
