import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  type Timestamp,
  setDoc,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth"
import { db, auth, storage } from "./firebase"

// Types
export type Medicine = {
  id?: string
  name: string
  category: string
  expiryDate: string
  quantity: number
  dosage: string
  uses?: string
  notes?: string
  imageUrl?: string
  userId: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export type UserProfile = {
  id: string
  name: string
  email: string
  role: "parent" | "child" | "grandparent"
  avatar?: string
  notificationsEnabled: boolean
}

export type FamilyMember = {
  id: string
  name: string
  role: "parent" | "child" | "grandparent"
  avatar?: string
  age?: number
  userId: string // ID of the user who added this family member
}

// API client for interacting with the backend

type ApiResponse<T> = {
  data?: T
  error?: string
}

// Base API URL - would come from environment variables in a real app
const API_BASE_URL = "/api"

// Generic fetch function with error handling
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`

    // Default headers
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    // Add authentication token if available
    const token = localStorage.getItem("auth_token")
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("API returned non-JSON response")
    }

    const data = await response.json()

    if (!response.ok) {
      return {
        error: data.message || "An error occurred",
      }
    }

    return { data }
  } catch (error) {
    console.error("API request failed:", error)
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// API endpoints for medicines
export const medicinesApi = {
  // Get all medicines for the current user
  async getAll() {
    try {
      const userId = auth.currentUser?.uid
      if (!userId) {
        return { error: "User not authenticated" }
      }

      const medicinesRef = collection(db, "medicines")
      const q = query(medicinesRef, where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      const medicines: Medicine[] = []
      querySnapshot.forEach((doc) => {
        medicines.push({ id: doc.id, ...doc.data() } as Medicine)
      })

      return { data: medicines }
    } catch (error) {
      console.error("Error fetching medicines:", error)
      return { error: error instanceof Error ? error.message : "Failed to fetch medicines" }
    }
  },

  // Get a specific medicine by ID
  async getById(id: string) {
    try {
      const userId = auth.currentUser?.uid
      if (!userId) {
        throw new Error("User not authenticated")
      }

      const docRef = doc(db, "medicines", id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        throw new Error("Medicine not found")
      }

      const medicine = { id: docSnap.id, ...docSnap.data() } as Medicine

      // Verify that the medicine belongs to the current user
      if (medicine.userId !== userId) {
        throw new Error("Unauthorized access to medicine")
      }

      return { data: medicine }
    } catch (error) {
      console.error("Error fetching medicine:", error)
      return { error: error instanceof Error ? error.message : "Failed to fetch medicine" }
    }
  },

  // Create a new medicine
  async create(medicineData: Omit<Medicine, "id" | "userId" | "createdAt" | "updatedAt">) {
    try {
      const userId = auth.currentUser?.uid
      if (!userId) {
        throw new Error("User not authenticated")
      }

      const medicine: Omit<Medicine, "id"> = {
        ...medicineData,
        userId,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      }

      const docRef = await addDoc(collection(db, "medicines"), medicine)

      return { data: { id: docRef.id, ...medicine } }
    } catch (error) {
      console.error("Error creating medicine:", error)
      return { error: error instanceof Error ? error.message : "Failed to create medicine" }
    }
  },

  // Update an existing medicine
  async update(id: string, medicineData: Partial<Medicine>) {
    try {
      const userId = auth.currentUser?.uid
      if (!userId) {
        throw new Error("User not authenticated")
      }

      // First, verify that the medicine belongs to the current user
      const docRef = doc(db, "medicines", id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        throw new Error("Medicine not found")
      }

      const medicine = docSnap.data() as Medicine
      if (medicine.userId !== userId) {
        throw new Error("Unauthorized access to medicine")
      }

      // Update the medicine
      const updateData = {
        ...medicineData,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(docRef, updateData)

      return { data: { id, ...medicine, ...medicineData } }
    } catch (error) {
      console.error("Error updating medicine:", error)
      return { error: error instanceof Error ? error.message : "Failed to update medicine" }
    }
  },

  // Delete a medicine
  async delete(id: string) {
    try {
      const userId = auth.currentUser?.uid
      if (!userId) {
        throw new Error("User not authenticated")
      }

      // First, verify that the medicine belongs to the current user
      const docRef = doc(db, "medicines", id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        throw new Error("Medicine not found")
      }

      const medicine = docSnap.data() as Medicine
      if (medicine.userId !== userId) {
        throw new Error("Unauthorized access to medicine")
      }

      // Delete the medicine
      await deleteDoc(docRef)

      return { data: true }
    } catch (error) {
      console.error("Error deleting medicine:", error)
      return { error: error instanceof Error ? error.message : "Failed to delete medicine" }
    }
  },

  // Upload a medicine image
  async uploadImage(file: File) {
    try {
      const userId = auth.currentUser?.uid
      if (!userId) {
        throw new Error("User not authenticated")
      }

      const fileExtension = file.name.split(".").pop()
      const fileName = `${userId}_${Date.now()}.${fileExtension}`
      const storageRef = ref(storage, `medicines/${fileName}`)

      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      return { data: { imageUrl: downloadURL } }
    } catch (error) {
      console.error("Error uploading image:", error)
      return { error: error instanceof Error ? error.message : "Failed to upload image" }
    }
  },
}

// API endpoints for users and authentication
export const authApi = {
  // Get current user
  getCurrentUser() {
    return auth.currentUser
  },

  // Register new user
  async register(email: string, password: string, name: string) {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update user profile
      await updateProfile(user, { displayName: name })

      // Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role: "parent",
        notificationsEnabled: true,
        createdAt: serverTimestamp(),
      })

      return { data: { user } }
    } catch (error) {
      console.error("Error registering user:", error)
      return { error: error instanceof Error ? error.message : "Failed to register user" }
    }
  },

  // Login user
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      return { data: { user } }
    } catch (error) {
      console.error("Error logging in:", error)
      return { error: error instanceof Error ? error.message : "Failed to log in" }
    }
  },

  // Logout user
  async logout() {
    try {
      await signOut(auth)
      return { data: true }
    } catch (error) {
      console.error("Error logging out:", error)
      return { error: error instanceof Error ? error.message : "Failed to log out" }
    }
  },

  // Get current user profile
  async getProfile() {
    try {
      const userId = auth.currentUser?.uid
      if (!userId) {
        throw new Error("User not authenticated")
      }

      const docRef = doc(db, "users", userId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        throw new Error("User profile not found")
      }

      const userProfile = { id: docSnap.id, ...docSnap.data() } as UserProfile

      // Get family members
      const familyMembersRef = collection(db, "familyMembers")
      const q = query(familyMembersRef, where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      const familyMembers: FamilyMember[] = []
      querySnapshot.forEach((doc) => {
        familyMembers.push({ id: doc.id, ...doc.data() } as FamilyMember)
      })

      return {
        data: {
          ...userProfile,
          familyMembers,
        },
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return { error: error instanceof Error ? error.message : "Failed to fetch user profile" }
    }
  },

  // Update user profile
  async updateProfile(profileData: Partial<UserProfile>) {
    try {
      const userId = auth.currentUser?.uid
      if (!userId) {
        throw new Error("User not authenticated")
      }

      const docRef = doc(db, "users", userId)

      // Update the profile
      const updateData = {
        ...profileData,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(docRef, updateData)

      // If name is updated, also update the Firebase Auth profile
      if (profileData.name && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: profileData.name })
      }

      return { data: { id: userId, ...profileData } }
    } catch (error) {
      console.error("Error updating user profile:", error)
      return { error: error instanceof Error ? error.message : "Failed to update user profile" }
    }
  },

  // Get family members
  async getFamilyMembers() {
    try {
      const userId = auth.currentUser?.uid
      if (!userId) {
        throw new Error("User not authenticated")
      }

      const familyMembersRef = collection(db, "familyMembers")
      const q = query(familyMembersRef, where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      const familyMembers: FamilyMember[] = []
      querySnapshot.forEach((doc) => {
        familyMembers.push({ id: doc.id, ...doc.data() } as FamilyMember)
      })

      return { data: familyMembers }
    } catch (error) {
      console.error("Error fetching family members:", error)
      return { error: error instanceof Error ? error.message : "Failed to fetch family members" }
    }
  },

  // Add family member
  async addFamilyMember(memberData: Omit<FamilyMember, "id" | "userId">) {
    try {
      const userId = auth.currentUser?.uid
      if (!userId) {
        throw new Error("User not authenticated")
      }

      const familyMember = {
        ...memberData,
        userId,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "familyMembers"), familyMember)

      return { data: { id: docRef.id, ...familyMember } }
    } catch (error) {
      console.error("Error adding family member:", error)
      return { error: error instanceof Error ? error.message : "Failed to add family member" }
    }
  },

  // Update family member
  async updateFamilyMember(id: string, memberData: Partial<FamilyMember>) {
    try {
      const userId = auth.currentUser?.uid
      if (!userId) {
        throw new Error("User not authenticated")
      }

      // First, verify that the family member belongs to the current user
      const docRef = doc(db, "familyMembers", id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        throw new Error("Family member not found")
      }

      const familyMember = docSnap.data() as FamilyMember
      if (familyMember.userId !== userId) {
        throw new Error("Unauthorized access to family member")
      }

      // Update the family member
      const updateData = {
        ...memberData,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(docRef, updateData)

      return { data: { id, ...familyMember, ...memberData } }
    } catch (error) {
      console.error("Error updating family member:", error)
      return { error: error instanceof Error ? error.message : "Failed to update family member" }
    }
  },

  // Delete family member
  async deleteFamilyMember(id: string) {
    try {
      const userId = auth.currentUser?.uid
      if (!userId) {
        throw new Error("User not authenticated")
      }

      // First, verify that the family member belongs to the current user
      const docRef = doc(db, "familyMembers", id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        throw new Error("Family member not found")
      }

      const familyMember = docSnap.data() as FamilyMember
      if (familyMember.userId !== userId) {
        throw new Error("Unauthorized access to family member")
      }

      // Delete the family member
      await deleteDoc(docRef)

      return { data: true }
    } catch (error) {
      console.error("Error deleting family member:", error)
      return { error: error instanceof Error ? error.message : "Failed to delete family member" }
    }
  },
}

// API endpoints for reminders
export const remindersApi = {
  // Get all reminders
  async getAll() {
    return fetchApi<any[]>("/reminders")
  },

  // Create a new reminder
  async create(reminderData: any) {
    return fetchApi<any>("/reminders", {
      method: "POST",
      body: JSON.stringify(reminderData),
    })
  },

  // Update a reminder
  async update(id: string, reminderData: any) {
    return fetchApi<any>(`/reminders/${id}`, {
      method: "PUT",
      body: JSON.stringify(reminderData),
    })
  },

  // Delete a reminder
  async delete(id: string) {
    return fetchApi<void>(`/reminders/${id}`, {
      method: "DELETE",
    })
  },
}

// API endpoints for analytics
export const analyticsApi = {
  // Get adherence data
  async getAdherenceData(timeRange: string) {
    return fetchApi<any>(`/analytics/adherence?timeRange=${timeRange}`)
  },

  // Get inventory statistics
  async getInventoryStats() {
    return fetchApi<any>("/analytics/inventory")
  },

  // Get medicine usage data
  async getUsageData(timeRange: string) {
    return fetchApi<any>(`/analytics/usage?timeRange=${timeRange}`)
  },
}

