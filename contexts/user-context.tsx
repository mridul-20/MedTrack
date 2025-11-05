"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAuth } from "./auth-context"
import { authApi } from "@/lib/api"

type Role = "parent" | "child" | "grandparent"

type FamilyMember = {
  id: string
  name: string
  role: Role
  avatar: string
  age?: number
}

type User = {
  id: string
  name: string
  email: string
  role: Role
  avatar: string
  notificationsEnabled: boolean
  familyMembers: FamilyMember[]
}

type UserContextType = {
  user: User | null
  loading: boolean
  switchUser: (userId: string) => void
  updateUser: (userData: Partial<User>) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { user: authUser, loading: authLoading } = useAuth()

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const result = await authApi.getProfile()
        if (result.data) {
          setUser({
            id: result.data.id,
            name: result.data.name || authUser.displayName || "User",
            email: result.data.email || authUser.email || "",
            role: result.data.role || "parent",
            avatar: result.data.avatar || "/placeholder.svg?height=100&width=100",
            notificationsEnabled: result.data.notificationsEnabled || false,
            familyMembers: result.data.familyMembers || [],
          })
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchUserProfile()
    }
  }, [authUser, authLoading])

  const switchUser = async (userId: string) => {
    if (!user) return

    const targetMember = user.familyMembers.find(member => member.id === userId)
    if (!targetMember) return

    // In a real app, this would switch the active user in the backend
    // For now, we'll just update the local state
    const newUser = {
      ...user,
      id: targetMember.id,
      name: targetMember.name,
      role: targetMember.role,
      avatar: targetMember.avatar,
      familyMembers: [
        {
          id: user.id,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
        ...user.familyMembers.filter(member => member.id !== userId)
      ]
    }

    setUser(newUser)
  }

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return

    try {
      const result = await authApi.updateProfile(userData)
      if (result.data) {
        setUser({ ...user, ...userData })
      }
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  }

  return (
    <UserContext.Provider value={{ user, loading, switchUser, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

