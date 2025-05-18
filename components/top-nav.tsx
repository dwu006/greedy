"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/app/utils/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { Home, Leaf } from "lucide-react"

export function TopNav({ userType }: { userType: "instructor" | "student" }) {
  const router = useRouter();
  const supabase = createClient();

  // Handle logout
  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      // Preserving local data as requested by the user
      // This keeps all your activities and data available after logout
      
      // Show success message
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account."
      });
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred while trying to log out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <motion.div
      className="w-full border-b border-forest-100 bg-white/80 backdrop-blur-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link href={`/${userType}/dashboard`} className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-forest-500 animate-leaf-sway" />
          <span className="text-2xl font-marcellus text-forest-700">Greedy</span>
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                  <AvatarFallback className="bg-forest-100 text-forest-700">U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  )
}
