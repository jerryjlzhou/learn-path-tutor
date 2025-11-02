import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, MapPin, Calendar, Award } from 'lucide-react';

export function AboutSection() {
  const credentials = [
    {
      icon: GraduationCap,
      title: "Education",
      details: ["North Sydney Boys High School 2022", "• ATAR 97.10", "• E4 Maths extension 1", "• Band 6 English Advanced", "Bachelor of Computer Science (Artificial Intelligence) @ UNSW"]
    },
    {
      icon: Calendar,
      title: "Experience",
      details: ["4+ years experience in private tutoring", "OC / Selective specialist for 4+ years at Alpha One Coaching College"]
    },
    // {
    //   icon: Award,
    //   title: "Expertise", 
    //   details: ["OC & Selective entrance exams", "High-School Maths & English"]
    // },
    {
      icon: MapPin,
      title: "Location",
      details: ["Online sessions available", "Face-to-face in Sydney"]
    }
  ];

  return (
    <section className="py-20">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              About Me
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experienced educator dedicated to helping students achieve their academic goals
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Credentials */}
            <div className="space-y-6">
              {credentials.map((credential, index) => (
                <Card key={index} className="shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                        <credential.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{credential.title}</h3>
                        <ul className="space-y-1">
                          {credential.details.map((detail, i) => (
                            <li key={i} className="text-muted-foreground">
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Profile Summary */}
            <div className="space-y-6">
              <Card className="shadow-medium">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                      LP
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Jerry Zhou</h3>
                    <div className="flex justify-center gap-2 mb-4">
                      <Badge>UNSW Student</Badge>
                      <Badge variant="secondary">4 Years Experience</Badge>
                    </div>
                  </div>

                  <div className="space-y-4 text-center">
                    <p className="text-muted-foreground">
                      Hello! I'm Jerry :)
                    </p>
                    <p className='text-muted-foreground'>
                      If you need to lock in for your next big exam, 
                      or just want some extra help with school work, book in a free trial 
                      now. 
                    </p>
                    <p className="text-muted-foreground"> 
                      With me, you get one-on-one attention and lessons that are actually interesting.
                      Any question is welcome, no matter how big or small, I’ll help you figure it out!
                    </p>  
                  </div>

                  {/* Success Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">4+</div>
                      <div className="text-sm text-muted-foreground">Years</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">20+</div>
                      <div className="text-sm text-muted-foreground">Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">5 Star</div>
                      <div className="text-sm text-muted-foreground">Rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}