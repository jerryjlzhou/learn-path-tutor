import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, MessageCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface MessageThread {
  id: string;
  title: string;
  created_at: string;
  last_message_at: string | null;
  messages: Message[];
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  profiles: {
    full_name: string;
    role: string;
    profile_picture_url?: string;
  };
}

export function StudentMessages() {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: threadsData, error } = await supabase
        .from('message_threads')
        .select(`
          *,
          messages (
            *,
            profiles!messages_sender_id_fkey (
              full_name,
              role,
              profile_picture_url
            )
          )
        `)
        .eq('student_id', user.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      setThreads(threadsData || []);
    } catch (error) {
      console.error('Error loading threads:', error);
      toast({
        title: "Error loading messages",
        description: "Failed to load your message threads.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewThread = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: newThread, error } = await supabase
        .from('message_threads')
        .insert({
          student_id: user.id,
          title: 'New Chat with Tutor'
        })
        .select()
        .single();

      if (error) throw error;

      // Add to threads list
      const threadWithMessages = {
        ...newThread,
        messages: []
      };
      setThreads([threadWithMessages, ...threads]);
      setSelectedThread(threadWithMessages);

      toast({
        title: "New chat created",
        description: "You can now send messages to your tutor.",
      });
    } catch (error) {
      console.error('Error creating thread:', error);
      toast({
        title: "Error creating chat",
        description: "Failed to create new message thread.",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;

    setSendingMessage(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('messages')
        .insert({
          thread_id: selectedThread.id,
          sender_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      // Update thread's last_message_at
      await supabase
        .from('message_threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedThread.id);

      setNewMessage('');
      await loadThreads();

      toast({
        title: "Message sent",
        description: "Your message has been sent to the tutor.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Failed to send your message.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-96">
        <Card className="animate-pulse">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
      {/* Thread List */}
      <Card className="md:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Messages</CardTitle>
            <Button size="sm" onClick={createNewThread}>
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {threads.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs mt-1">Click "New Chat" to start</p>
              </div>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
                    selectedThread?.id === thread.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedThread(thread)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">T</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">{thread.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {thread.last_message_at
                          ? format(new Date(thread.last_message_at), 'MMM d, h:mm a')
                          : format(new Date(thread.created_at), 'MMM d, h:mm a')
                        }
                      </p>
                      {thread.messages.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {thread.messages[thread.messages.length - 1]?.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Thread Messages */}
      <Card className="md:col-span-2">
        {selectedThread ? (
          <>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{selectedThread.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[500px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedThread.messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No messages in this chat yet</p>
                    <p className="text-sm mt-1">Send a message to start the conversation</p>
                  </div>
                ) : (
                  selectedThread.messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.profiles?.profile_picture_url} />
                        <AvatarFallback className="text-xs">
                          {message.profiles?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {message.profiles?.full_name || 'Unknown User'}
                          </span>
                          <Badge variant={message.profiles?.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                            {message.profiles?.role === 'admin' ? 'Tutor' : 'Student'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm bg-muted rounded-lg p-3">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Separator />

              {/* Message Input */}
              <div className="p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message to the tutor..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="resize-none"
                    rows={2}
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    size="sm"
                    className="h-auto"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p className="text-sm">Choose a chat from the left to view messages</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}