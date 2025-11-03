import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, Send, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import JerryFullProfile from '@/assets/images/JerryFullProfile.png';
import Logonamed from '@/assets/images/Logonamed.png'

export default function ContactPage() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !contact || !query) {
      toast({
        title: "Missing fields",
        description: "Please fill out all fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-contact-form', {
        body: {
          name,
          contact,
          query,
        },
      });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. I'll get back to you soon.",
      });

      // Reset form
      setName('');
      setContact('');
      setQuery('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try contacting me directly via email or phone.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Get In Touch
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions or ready to start your learning journey? I'd love to hear from you!
            </p>
          </div>

          {/* Main Content */}
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-start">
            {/* Left Column - Profile & Contact Info */}
            <div className="space-y-6">
              {/* Profile Picture Placeholder */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <img 
                  src={Logonamed} 
                  alt="Logo" 
                  />
                </CardContent>
              </Card>

              {/* Direct Contact Info */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-2xl font-semibold mb-4">
                    Feel free to contact me directly via:
                  </h2>
                  
                  {/* Phone */}
                  <a
                    href="tel:0424221593"
                    className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-semibold">0424 221 593</p>
                    </div>
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:jerry.zhou25@gmail.com"
                    className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold">jerry.zhou25@gmail.com</p>
                    </div>
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Contact Form */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Send Me a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Email/Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="contact">Email or Phone Number *</Label>
                    <Input
                      id="contact"
                      placeholder="Your email or phone number"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      required
                    />
                  </div>

                  {/* Query */}
                  <div className="space-y-2">
                    <Label htmlFor="query">Your Query *</Label>
                    <Textarea
                      id="query"
                      placeholder="Tell me how I can help you..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      rows={6}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
