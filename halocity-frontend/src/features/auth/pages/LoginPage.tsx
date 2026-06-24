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
import AuthLayout from '../components/AuthLayout'

const demoCreds = [
  { label: 'City Commander', email: 'admin@halocity.ng', password: 'HaloCity@2026' },
  { label: 'Mayor', email: 'odusolaolawale@gmail.com', password: 'HaloCity@2026' },
]

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

  const fillDemo = (email: string, password: string) => {
    form.setValue('email', email)
    form.setValue('password', password)
    setTimeout(() => form.handleSubmit(onSubmit)(), 300)
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">Sign in to your HaloCity account</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
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

          <Button type="submit" className="w-full font-semibold" disabled={pending}>
            {pending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </Form>

      <details className="mt-4 rounded-lg border border-border bg-white/50 p-3">
        <summary className="cursor-pointer text-xs font-medium text-[#64748B] hover:text-[#0F172A]">
          Demo Access
        </summary>
        <div className="mt-2 space-y-2 text-xs text-[#64748B]">
          {demoCreds.map((cred) => (
            <div key={cred.label} className="flex items-center justify-between gap-2">
              <span>
                <span className="font-medium text-[#0F172A]">{cred.label}:</span>{' '}
                {cred.email} / {cred.password}
              </span>
              <button
                type="button"
                onClick={() => fillDemo(cred.email, cred.password)}
                className="whitespace-nowrap rounded bg-primary px-2 py-0.5 text-white transition-opacity hover:opacity-80"
              >
                Use →
              </button>
            </div>
          ))}
          <p className="pt-1">
            <span className="font-medium text-[#0F172A]">Citizen:</span>{' '}
            <Link to="/register" className="text-primary hover:underline">Register a new account →</Link>
          </p>
        </div>
      </details>

      <p className="mt-6 text-center text-sm text-[#64748B]">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Register →
        </Link>
      </p>
    </AuthLayout>
  )
}
