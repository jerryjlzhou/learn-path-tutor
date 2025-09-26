import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MessageThread {
  id: string;
  title: string;
  student_id: string;
  created_at: string;
  last_message_at: string;
  profiles: {
    full_name: string;
    email: string;
    profile_picture_url?: string;
  };
  messages: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    is_read: boolean;
    profiles: {
      full_name: string;
      role: string;
    };
  }[];
}

export function ForumManager() {
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
      const { data, error } = await supabase
        .from('message_threads')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Simplified approach - just set empty arrays for now
      const threadsWithData = (data || []).map(thread => ({
        ...thread,
        profiles: { full_name: 'Student', email: '', profile_picture_url: '' },
        messages: []
      }));

      setThreads(threadsWithData);
    } catch (error) {
      console.error('Error loading threads:', error);
      toast({
        title: "Error loading messages",
        description: "There was a problem loading the message threads.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectThread = async (thread: MessageThread) => {
    setSelectedThread(thread);
    
    // Mark messages as read
    const { data: { user } } = await supabase.auth.getUser();
    const unreadMessages = thread.messages.filter(msg => !msg.is_read && msg.sender_id !== user?.id);
    
    if (unreadMessages.length > 0) {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', unreadMessages.map(msg => msg.id));

      if (!error) {
        // Refresh threads to update read status
        loadThreads();
      }
    }
  };

  const sendMessage = async () => {
    if (!selectedThread || !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('messages')
        .insert({
          thread_id: selectedThread.id,
          sender_id: user.id,
          content: newMessage.trim(),
        });

      if (error) throw error;

      // Update thread's last_message_at
      await supabase
        .from('message_threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedThread.id);

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });

      setNewMessage('');
      
      // Reload threads to get the new message
      await loadThreads();
      
      // Update selected thread
      const updatedThread = threads.find(t => t.id === selectedThread.id);
      if (updatedThread) {
        setSelectedThread(updatedThread);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "There was a problem sending your message.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const getUnreadCount = (thread: MessageThread) => {
    return thread.messages.filter(msg => !msg.is_read && msg.profiles.role !== 'admin').length;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-32 mb-4"></div>
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-3 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Thread List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Message Threads
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {threads.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 px-6">
              No message threads found.
            </p>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              {threads.map((thread) => {
                const unreadCount = getUnreadCount(thread);
                const lastMessage = thread.messages[thread.messages.length - 1];
                
                return (
                  <div
                    key={thread.id}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedThread?.id === thread.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => selectThread(thread)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={thread.profiles.profile_picture_url} />
                        <AvatarFallback>
                          {thread.profiles.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium truncate">
                            {thread.profiles.full_name}
                          </h4>
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage ? lastMessage.content : 'No messages yet'}
                        </p>
                        
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(thread.last_message_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message View */}
      <Card className="lg:col-span-2">
        {selectedThread ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedThread.profiles.profile_picture_url} />
                  <AvatarFallback>
                    {selectedThread.profiles.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {selectedThread.profiles.full_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedThread.profiles.email}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex flex-col h-[400px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 py-4">
                {selectedThread.messages.map((message) => {
                  const isAdmin = message.profiles.role === 'admin';
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isAdmin
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isAdmin ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[60px]"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Select a thread to view messages
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}