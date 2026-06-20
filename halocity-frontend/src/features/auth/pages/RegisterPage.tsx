import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuth } from '@/shared/stores/AuthContext'
import { registerSchema } from '@/features/auth/schemas'
import type { z } from 'zod'

type RegisterFormData = z.infer<typeof registerSchema>
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
      role: 'CITIZEN',
    },
  })

  const watchRole = form.watch('role')

  const onSubmit = async (values: RegisterFormData) => {
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
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary text-lg font-bold text-white">
            HC
          </div>
          <h1 className="text-xl font-semibold text-[#0F172A]">Create your account</h1>
          <p className="mt-1 text-sm text-[#64748B]">Join HaloCity</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-2">
              {(['CITIZEN', 'MAYOR'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => form.setValue('role', role)}
                  className={cn(
                    'flex-1 rounded-lg border p-3 text-center text-sm font-medium transition-colors',
                    watchRole === role
                      ? 'border-primary bg-primary-light text-primary-text'
                      : 'border-border text-[#64748B] hover:border-primary/50',
                  )}
                >
                  {role === 'CITIZEN' ? 'Citizen' : 'Marshal'}
                </button>
              ))}
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
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
