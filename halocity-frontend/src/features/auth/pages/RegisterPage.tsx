import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuth } from '@/shared/stores/AuthContext'
import { registerSchema, type RegisterInput } from '@/features/auth/schemas'
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
import { cn } from '@/shared/lib/utils'
import AuthLayout from '../components/AuthLayout'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'CITIZEN' as const,
    },
  })

  const watchRole = form.watch('role')

  const onSubmit = async (values: RegisterInput) => {
    setPending(true)
    try {
      await register({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: values.role,
      })
      toast.success('Account created successfully')
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      toast.error(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">Join HaloCity</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <p className="mb-2 block text-sm font-medium text-foreground">I want to join as</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => form.setValue('role', 'CITIZEN')}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-lg border p-3 text-center text-sm transition-colors',
                  watchRole === 'CITIZEN'
                    ? 'border-primary bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-primary/50',
                )}
              >
                <span className="text-sm font-medium text-slate-900">Citizen</span>
                <span className="text-[11px] text-slate-500">Report incidents and track status</span>
              </button>
              <button
                type="button"
                onClick={() => form.setValue('role', 'MAYOR')}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-lg border p-3 text-center text-sm transition-colors',
                  watchRole === 'MAYOR'
                    ? 'border-primary bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-primary/50',
                )}
              >
                <span className="text-sm font-medium text-slate-900">Mayor</span>
                <span className="text-[11px] text-slate-500">Respond to incidents in your zone</span>
              </button>
            </div>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+2348012345678" {...field} />
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
                  <Input type="password" placeholder="Min. 8 characters with a number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-[#64748B]">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in →
        </Link>
      </p>
      <p className="mt-2 text-center text-[11px] text-slate-400">
        Admin accounts are provisioned internally.
      </p>
    </AuthLayout>
  )
}
