import { Card, CardContent } from '@/components/ui/card';
import { Calendar, BookOpen, Star } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Calendar,
      title: "Book",
      description: "Choose your preferred time slot and book a session online or in-person."
    },
    {
      icon: BookOpen,
      title: "Lesson",
      description: "Receive personalized 1-on-1 tutoring focused on your specific needs and goals."
    },
    {
      icon: Star,
      title: "Review",
      description: "Track your progress and provide feedback to help us improve your learning experience."
    }
  ];

  return (
    <section className="py-20">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Getting started is simple. Follow these three easy steps
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="relative shadow-soft transition-smooth hover:shadow-medium">
                <CardContent className="p-8 text-center">
                  {/* Step number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mb-4 mt-4">
                    <step.icon className="h-12 w-12 text-primary mx-auto" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}