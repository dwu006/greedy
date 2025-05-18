"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/app/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import { Leaf, Mail, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Separate component to safely use searchParams
function LoginContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorMessage = searchParams.get("error")
  // Universal login - everyone uses the same dashboard now
  const userType = "instructor"
  
  const supabase = createClient()
  
  // Check if user is already authenticated on page load
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // User is already logged in, redirect to dashboard
        router.push('/instructor/dashboard')
      }
    }
    
    // If there's an error message, show it
    if (errorMessage) {
      setError(errorMessage)
    } else {
      checkUser()
    }
    // We intentionally omit dependencies to run this only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [])
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      })
      
      if (error) throw error
      
      // Redirect to dashboard
      router.push('/instructor/dashboard')
    } catch (error: any) {
      setError(error.message || "Failed to sign up")
    } finally {
      setLoading(false)
    }
  }
  
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)
    
    try {
      // First sign in with Google
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      // Redirect is handled by Supabase OAuth flow
    } catch (error: any) {
      setError(error.message || "Failed to sign in with Google")
      setGoogleLoading(false)
    }
  }
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      // After sign-in, update user metadata with the selected user type
      if (data?.user) {
        await supabase.auth.updateUser({
          data: { user_type: 'instructor' }
        })
      }
      
      // Redirect to dashboard
      router.push('/instructor/dashboard')
    } catch (error: any) {
      setError(error.message || "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-forest-50 via-leaf-50 to-white flex flex-col items-center justify-center px-4 grid-dots-bg">
      <div className="w-full max-w-md">
        <motion.div 
          className="text-center space-y-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="inline-flex items-center justify-center gap-2">
            <motion.div
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <Leaf className="h-8 w-8 text-forest-500" />
            </motion.div>
            <h1 className="text-4xl font-marcellus text-forest-800 tracking-tight">Greedy</h1>
          </Link>
          <h2 className="text-xl font-nunito text-forest-600">
            Account Access
          </h2>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-lg shadow-forest-100/50 border border-forest-100"
        >
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1" htmlFor="email">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1" htmlFor="password">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full"
                    placeholder="••••••••"
                  />
                </div>
                
                {error && (
                  <div className="text-rose-500 text-sm py-2">{error}</div>
                )}
                
                <Button
                  type="submit"
                  className="w-full bg-forest-600 hover:bg-forest-700 text-white"
                  disabled={loading || googleLoading}
                >
                  {loading ? "Signing in..." : "Sign In with Email"}
                </Button>
                
                <div className="relative my-4">
                  <Separator />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white px-2 text-xs text-gray-500">OR</span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                >
                  {googleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Image src="/google-logo.svg" alt="Google logo" width={18} height={18} />
                  )}
                  Continue with Google
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1" htmlFor="register-name">
                    Full Name
                  </label>
                  <Input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1" htmlFor="register-email">
                    Email
                  </label>
                  <Input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1" htmlFor="register-password">
                    Password
                  </label>
                  <Input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
                
                <div className="text-sm text-forest-600 mt-2">
                  <p>Creating your Greedy account</p>
                </div>
                
                {error && (
                  <div className="text-rose-500 text-sm py-2">{error}</div>
                )}
                
                <Button
                  type="submit"
                  className="w-full bg-forest-600 hover:bg-forest-700 text-white"
                  disabled={loading || googleLoading}
                >
                  {loading ? "Creating account..." : "Create Account with Email"}
                </Button>
                
                <div className="relative my-4">
                  <Separator />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white px-2 text-xs text-gray-500">OR</span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                >
                  {googleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Image src="/google-logo.svg" alt="Google logo" width={18} height={18} />
                  )}
                  Continue with Google
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </motion.div>
        
        <div className="mt-6 text-center text-forest-600 text-sm">
          <Link href="/" className="underline hover:text-forest-800">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-forest-500" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
