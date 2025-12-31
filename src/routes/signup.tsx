import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import RegisterForm from '@/components/shadcn-studio/blocks/register-01/register-form'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

function SignupPage() {
  return (
    <div className='relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8 bg-slate-50'>
      <Card className='z-1 w-full border border-slate-200 shadow-xl sm:max-w-lg bg-white text-slate-900'>
        <CardHeader className='gap-3'>
          <div>
            <CardTitle className='mb-1.5 text-2xl font-bold'>Sign Up to SPMB SMANSABA</CardTitle>
            <CardDescription className='text-base text-slate-500'>Mulai pendaftaran Anda di SMAN 1 Bantarujeg hari ini.</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className='space-y-4'>
            <RegisterForm />

            <p className='text-slate-500 text-center text-sm'>
              Already have an account?{' '}
              <Link to='/login' className='text-cyan-600 font-medium hover:underline'>
                Sign in instead
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
