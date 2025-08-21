
"use client";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const conversations = [
  { id: 1, name: "Maria Clara", task: "Leaky Faucet Repair", lastMessage: "Yes, I can come tomorrow at 2 PM.", unread: 2, avatar: "https://placehold.co/40x40" },
  { id: 2, name: "Jose Rizal", task: "Move a Couch", lastMessage: "Is the couch heavy? I might need a helper.", unread: 0, avatar: "https://placehold.co/40x40" },
  { id: 3, name: "Andres Bonifacio", task: "High School Math Tutor", lastMessage: "Sounds good, see you then!", unread: 0, avatar: "https://placehold.co/40x40" },
];

const messages = [
  { from: 'other', text: 'Hi! I saw your post about the leaky faucet. I am available to fix it.' },
  { from: 'me', text: 'That\'s great! When are you available?' },
  { from: 'other', text: 'I can come by tomorrow afternoon. Around 2 PM?' },
  { from: 'me', text: 'Perfect! See you then.' },
  { from: 'other', text: 'Yes, I can come tomorrow at 2 PM.' },
];

export default function MessagesPage() {
  return (
    <div className="container mx-auto h-[calc(100vh-120px)] p-4">
      <Card className="h-full w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 overflow-hidden">
        {/* Conversations List */}
        <div className="flex flex-col border-r">
          <div className="p-4 border-b">
            <h2 className="text-2xl font-headline font-bold">Messages</h2>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-9" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {conversations.map(convo => (
              <button key={convo.id} className="w-full text-left p-4 flex items-start gap-4 hover:bg-secondary transition-colors border-b">
                <Avatar>
                  <AvatarImage src={convo.avatar} data-ai-hint="profile person"/>
                  <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold truncate">{convo.name}</p>
                    {convo.unread > 0 && <span className="text-xs font-bold bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center">{convo.unread}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{convo.task}</p>
                  <p className="text-sm text-muted-foreground/80 truncate">{convo.lastMessage}</p>
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Chat Window */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col">
          <div className="p-4 border-b flex items-center gap-4">
            <Avatar>
              <AvatarImage src={conversations[0].avatar} data-ai-hint="profile person"/>
              <AvatarFallback>{conversations[0].name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold">{conversations[0].name}</p>
              <p className="text-sm text-muted-foreground">{conversations[0].task}</p>
            </div>
          </div>
          <ScrollArea className="flex-1 p-6">
            <div className="flex flex-col gap-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-end gap-3 ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  {msg.from === 'other' && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={conversations[0].avatar} data-ai-hint="profile person"/>
                      <AvatarFallback>{conversations[0].name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-xs lg:max-w-md p-4 rounded-3xl backdrop-blur-sm shadow-md ${msg.from === 'me' ? 'bg-primary/80 border border-primary/20 text-primary-foreground rounded-br-lg' : 'bg-muted/50 border border-border text-foreground rounded-bl-lg'}`}>
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <div className="relative">
              <Input placeholder="Type a message..." className="pr-20" />
              <Button className="absolute right-2 top-1/2 -translate-y-1/2" size="sm">Send</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
