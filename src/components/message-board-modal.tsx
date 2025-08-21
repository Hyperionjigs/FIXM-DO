"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, Shield, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NotificationService } from '@/lib/notifications';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  userRole: 'user' | 'owner' | 'admin';
  timestamp: any;
}

interface MessageBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
  postOwnerId: string;
  postOwnerName: string;
}

export function MessageBoardModal({
  isOpen,
  onClose,
  postId,
  postTitle,
  postOwnerId,
  postOwnerName
}: MessageBoardModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin (you can implement your own admin check logic)
  useEffect(() => {
    if (user?.email) {
      // Simple admin check - you can replace this with your actual admin logic
      const adminEmails = ['admin@fixmo.com', 'admin@example.com']; // Add your admin emails
      setIsAdmin(adminEmails.includes(user.email));
    }
  }, [user]);

  // Subscribe to messages
  useEffect(() => {
    if (!isOpen || !postId) return;

    const messagesRef = collection(db, 'messageBoards', postId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList: Message[] = [];
      snapshot.forEach((doc) => {
        messageList.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(messageList);
    });

    return () => unsubscribe();
  }, [isOpen, postId]);

  const getUserRole = (userId: string): 'user' | 'owner' | 'admin' => {
    if (isAdmin) return 'admin';
    if (userId === postOwnerId) return 'owner';
    return 'user';
  };

  const getRoleIcon = (role: 'user' | 'owner' | 'admin') => {
    switch (role) {
      case 'admin':
        return <Shield className="h-3 w-3 text-red-500" />;
      case 'owner':
        return <User className="h-3 w-3 text-blue-500" />;
      default:
        return <User className="h-3 w-3 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: 'user' | 'owner' | 'admin') => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'owner':
        return 'Post Owner';
      default:
        return 'User';
    }
  };

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    setIsLoading(true);
    try {
      const messagesRef = collection(db, 'messageBoards', postId, 'messages');
      const userRole = getUserRole(user.uid);
      const messageText = newMessage.trim();

      await addDoc(messagesRef, {
        text: messageText,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhotoURL: user.photoURL,
        userRole,
        timestamp: serverTimestamp(),
      });

      // Send notification to post owner if the sender is not the owner
      if (user.uid !== postOwnerId) {
        await NotificationService.notifyNewMessage(
          postOwnerId,
          postId,
          postTitle,
          user.displayName || 'Anonymous',
          messageText
        );
      }

      setNewMessage('');
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully.',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Message Board - {postTitle}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Messages are visible to you, the post owner, and administrators.
          </p>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 border rounded-lg p-4 mb-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.userId === user?.uid ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.userPhotoURL} />
                      <AvatarFallback>
                        {message.userName?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex-1 max-w-[70%] ${
                        message.userId === user?.uid ? 'text-right' : ''
                      }`}
                    >
                      <div
                        className={`inline-block p-3 rounded-lg ${
                          message.userId === user?.uid
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {getRoleIcon(message.userRole)}
                          <span className="text-xs font-medium">
                            {message.userName}
                          </span>
                          <span className="text-xs opacity-70">
                            ({getRoleLabel(message.userRole)})
                          </span>
                        </div>
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp?.toDate?.()?.toLocaleString() || 'Just now'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 resize-none"
              rows={2}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 