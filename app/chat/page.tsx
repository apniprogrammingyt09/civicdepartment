"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, MessageSquare, Users } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore"

export default function ChatPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [workers, setWorkers] = useState<any[]>([])

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Fetch department workers and other departments
  useEffect(() => {
    if (!user?.department.id) return

    // Fetch workers from current department
    const workersQuery = query(
      collection(db, 'civicUsers'),
      where('departmentId', '==', user.department.id)
    )

    const workersUnsubscribe = onSnapshot(workersQuery, (snapshot) => {
      const workerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'worker'
      }))
      
      // Fetch other department admins
      const adminsQuery = query(collection(db, 'users'))
      
      const adminsUnsubscribe = onSnapshot(adminsQuery, (adminSnapshot) => {
        const otherDepts = adminSnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            uid: doc.id,
            name: data.name,
            role: 'Department Admin',
            departmentId: data.departmentId,
            active: true,
            profileImage: data.profileImage || '/placeholder.svg',
            type: 'department'
          }
        }).filter(dept => dept.departmentId && dept.departmentId !== user.department.id)
        
        setWorkers([...workerList, ...otherDepts])
      })
      
      return () => adminsUnsubscribe()
    }, (error) => {
      console.error('Error fetching workers:', error)
    })

    return () => workersUnsubscribe()
  }, [user])

  // Fetch messages for selected worker
  useEffect(() => {
    if (!selectedWorker || !user) return

    const chatId = [user.id, selectedWorker].sort().join('_')
    console.log('Department chat - fetching messages for chatId:', chatId)
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isCurrentUser: doc.data().senderId === user.id
      })).sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime()
        const timeB = new Date(b.createdAt || 0).getTime()
        return timeA - timeB
      })
      console.log('Department chat - messages:', msgs)
      setMessages(msgs)
    })

    return () => unsubscribe()
  }, [selectedWorker, user])

  const handleSendMessage = async () => {
    if (message.trim() && user && selectedWorker) {
      try {
        const chatId = [user.id, selectedWorker].sort().join('_')
        console.log('Department sending message - chatId:', chatId, 'senderId:', user.id)
        await addDoc(collection(db, 'messages'), {
          chatId,
          senderId: user.id,
          senderName: user.name,
          message: message.trim(),
          timestamp: serverTimestamp(),
          createdAt: new Date().toISOString()
        })
        setMessage("")
      } catch (error) {
        console.error('Error sending message:', error)
      }
    }
  }

  if (selectedWorker) {
    const worker = workers.find(w => w.uid === selectedWorker)
    if (!worker) return null

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Chat Header */}
        <header className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedWorker(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={worker.profileImage || "/placeholder.svg"} alt={worker.name} />
              <AvatarFallback>
                {worker.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="font-semibold">{worker.name}</h2>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">{worker.role}</p>
                {worker.active && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isCurrentUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-lg p-3 max-w-xs ${
                  msg.isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {!msg.isCurrentUser && (
                  <p className="text-xs font-medium mb-1">{msg.senderName}</p>
                )}
                <p className="text-sm">{msg.message}</p>
                <span
                  className={`text-xs ${msg.isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                >
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ''}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold font-orbitron">DEPARTMENT CHAT</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{workers.length}</div>
            <div className="text-sm text-muted-foreground">Total Workers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-6 h-6 mx-auto mb-2 bg-green-500 rounded-full"></div>
            <div className="text-2xl font-bold">{workers.filter(w => w.active).length}</div>
            <div className="text-sm text-muted-foreground">Active Workers</div>
          </CardContent>
        </Card>
      </div>

      {/* Department Workers */}
      {workers.filter(w => w.type === 'worker').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Department Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workers.filter(w => w.type === 'worker').map((worker) => (
                <div
                  key={worker.id}
                  className="p-4 bg-accent rounded border cursor-pointer hover:bg-accent/80 transition-colors"
                  onClick={() => setSelectedWorker(worker.uid)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={worker.profileImage || "/placeholder.svg"} alt={worker.name} />
                        <AvatarFallback>
                          {worker.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {worker.active && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{worker.name}</h3>
                        <Badge variant={worker.active ? "default" : "secondary"} className="text-xs">
                          {worker.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{worker.role}</p>
                      <p className="text-sm text-muted-foreground">{worker.location || 'No location set'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Departments */}
      {workers.filter(w => w.type === 'department').length > 0 && (
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-300">Other Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workers.filter(w => w.type === 'department').map((dept) => (
                <div
                  key={dept.id}
                  className="p-4 bg-white rounded border cursor-pointer hover:bg-blue-50 transition-colors dark:bg-blue-900 dark:hover:bg-blue-800 dark:border-blue-800"
                  onClick={() => setSelectedWorker(dept.uid)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={dept.profileImage || "/placeholder.svg"} alt={dept.name} />
                      <AvatarFallback className="bg-blue-500 text-white dark:bg-blue-700 dark:text-white">
                        {dept.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3 className="font-semibold dark:text-blue-100">{dept.name}</h3>
                      <p className="text-sm text-muted-foreground dark:text-blue-300">{dept.role}</p>
                      <Badge variant="outline" className="text-xs mt-1 dark:border-blue-400 dark:text-blue-200">
                        Department
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {workers.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Contacts Found</h3>
          <p className="text-sm text-muted-foreground">
            Create workers in the Admin panel to start chatting.
          </p>
        </div>
      )}
    </div>
  )
}