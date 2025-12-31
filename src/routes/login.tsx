import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import LoginForm from '@/components/shadcn-studio/blocks/login-page-01/login-form'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className='relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8 bg-slate-50'>
      <Card className='z-1 w-full border border-slate-200 shadow-xl sm:max-w-lg bg-white text-slate-900'>
        <CardHeader className='gap-3'>
          {/* <Logo className='gap-3' /> */}
          <div>
            <CardTitle className='mb-1.5 text-2xl font-bold'>Sign in to SPMB SMANSABA</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <LoginForm />

            <p className='text-slate-500 text-center text-sm'>
              New on our platform?{' '}
              <Link to='/signup' className='text-cyan-600 font-medium hover:underline'>
                Create an account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
