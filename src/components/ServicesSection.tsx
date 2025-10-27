import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calculator, PenTool, Trophy, Clock, Users } from 'lucide-react';

export function ServicesSection() {
  const services = [
    {
      icon: Trophy,
      title: "Selective & OC Exam prep",
      description: "Specialist help for Thinking Skills, Mathematical Reasoning, Reading and Writing for OC and Selective school entrance exams",
      badge: "Popular"
    },
    {
      icon: Calculator,
      title: "High School Maths",
      description: "From Year 7 to HSC Extension Maths, covering all topics with clear explanations and problem-solving techniques.",
      badge: "Popular"
    },
    {
      icon: PenTool,
      title: "High School English",
      description: "Comprehensive lessons for HSC English Advanced, essay writing and short-answer comprehension",
      badge: ""
    },
    {
      icon: BookOpen,
      title: "Homework help",
      description: "Free and unlimited homework. Just send a question and get a detailed video solution in 24 hours",
      badge: ""
    }
  ];

  const features = [
    { icon: Clock, text: "Flexible scheduling" },
    { icon: Users, text: "1-on-1 personalized attention" },
    { icon: BookOpen, text: "Customized learning materials" },
  ];

  return (
    <section className="py-20 bg-muted/20">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Specialized Tutoring Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Personalized learning programs designed to help students excel in their academic journey
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {services.map((service, index) => (
              <Card key={index} className="shadow-soft transition-smooth hover:shadow-medium h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <service.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">{service.title}</h3>
                    </div>
                    {service.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {service.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-muted-foreground">
                <feature.icon className="h-5 w-5 text-primary" />
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}