"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { UserIcon, Users2Icon, BellIcon, ShieldIcon, PlusIcon, Pencil, Trash2Icon } from "lucide-react"
import { PageShell } from "@/components/page-shell"

// Mock user data
const currentUser = {
  id: "user1",
  name: "Sarah Johnson",
  email: "sarah@example.com",
  role: "parent",
  avatar: "/placeholder.svg?height=100&width=100",
  notificationsEnabled: true,
  familyMembers: [
    {
      id: "user2",
      name: "Mike Johnson",
      role: "parent",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "user3",
      name: "Emma Johnson",
      role: "child",
      avatar: "/placeholder.svg?height=100&width=100",
      age: 12,
    },
    {
      id: "user4",
      name: "Robert Johnson",
      role: "grandparent",
      avatar: "/placeholder.svg?height=100&width=100",
    },
  ],
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [user, setUser] = useState(currentUser)
  const [editMode, setEditMode] = useState(false)
  const [editedUser, setEditedUser] = useState(currentUser)

  const handleSaveProfile = () => {
    setUser(editedUser)
    setEditMode(false)
  }

  const handleToggleNotifications = (enabled: boolean) => {
    setUser({ ...user, notificationsEnabled: enabled })
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "parent":
        return "Parent"
      case "child":
        return "Child"
      case "grandparent":
        return "Grandparent"
      default:
        return "Family Member"
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "parent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "child":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "grandparent":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-200">Family cockpit</p>
          <h1 className="text-4xl font-semibold text-white">User Profile</h1>
          <p className="text-white/70">Share access, coordinate reminders, and keep every caregiver in sync.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Family Members</CardTitle>
                <CardDescription>Manage your family profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-sm text-white/60">Active Profile</p>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  {user.familyMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 rounded-2xl border border-white/5 p-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-white">{member.name}</p>
                        <div className={`inline-block rounded-full px-2 py-0.5 text-xs ${getRoleBadgeColor(member.role)}`}>
                          {getRoleLabel(member.role)}
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" className="mt-4 w-full">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Family Member
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 flex flex-wrap gap-2 bg-white/5 text-white/70">
                <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="family" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">
                  <Users2Icon className="mr-2 h-4 w-4" />
                  Family Management
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900"
                >
                  <BellIcon className="mr-2 h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="privacy" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">
                  <ShieldIcon className="mr-2 h-4 w-4" />
                  Privacy
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Personal Information</CardTitle>
                      <CardDescription>Manage your personal details</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setEditMode(!editMode)}>
                      {editMode ? "Cancel" : "Edit"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {editMode ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={editedUser.name}
                            onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editedUser.email}
                            onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select
                            value={editedUser.role}
                            onValueChange={(value) => setEditedUser({ ...editedUser, role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="parent">Parent</SelectItem>
                              <SelectItem value="child">Child</SelectItem>
                              <SelectItem value="grandparent">Grandparent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                            <div className={`inline-block rounded-full px-2 py-0.5 text-xs ${getRoleBadgeColor(user.role)}`}>
                              {getRoleLabel(user.role)}
                            </div>
                          </div>
                        </div>

                        <Separator className="bg-white/10" />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-sm text-white/60">Email</p>
                            <p className="text-white">{user.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-white/60">Family Members</p>
                            <p className="text-white">{user.familyMembers.length}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  {editMode && (
                    <CardFooter>
                      <Button onClick={handleSaveProfile}>Save Changes</Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageShell>
  )
}