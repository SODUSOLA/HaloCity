import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuth } from '@/shared/stores/AuthContext'
import { loginSchema, type LoginInput } from '@/features/auth/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginInput) => {
    setPending(true)
    try {
      await login(values.email, values.password)
      toast.success('Welcome back')
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      toast.error(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary text-lg font-bold text-white">
            HC
          </div>
          <h1 className="text-xl font-semibold text-[#0F172A]">Sign in to HaloCity</h1>
          <p className="mt-1 text-sm text-[#64748B]">Operations platform</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Form>

        <details className="mt-4 rounded-lg border border-border bg-white/50 p-3">
          <summary className="cursor-pointer text-xs font-medium text-[#64748B] hover:text-[#0F172A]">
            Demo credentials
          </summary>
          <div className="mt-2 space-y-1 text-xs text-[#64748B]">
            <p><span className="font-medium text-[#0F172A]">Admin:</span> admin@halocity.ng / HaloCity@2026</p>
            <p><span className="font-medium text-[#0F172A]">Mayor:</span> bola.tinubu@example.com / HaloCity@2026</p>
            <p><span className="font-medium text-[#0F172A]">Citizen:</span> amaka.okonkwo@example.com / HaloCity@2026</p>
          </div>
        </details>

        <p className="mt-6 text-center text-sm text-[#64748B]">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
