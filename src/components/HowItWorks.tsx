import { Card, CardContent } from '@/components/ui/card';
import { Calendar, BookOpen, GraduationCap } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Calendar,
      title: "Book",
      description: "Schedule your personalized tutoring session",
      bulletPoints: [
        "Choose a timeslot directly on our website",
        "Choose between a 1 hour, 1.5 hour or 2 hour lesson",
        "Select your online / in-person preference",
        "Request specific subject help",
        "Booking confirmation sent directly to your email"
      ]
    },
    {
      icon: BookOpen,
      title: "Lesson",
      description: "Engage in interactive one-on-one learning",
      bulletPoints: [
        "Join via secure Zoom link for online lessons",
        "Your choice of location for in-person lessons (in Sydney)",
        "All lesson and homework material provided",
        "Specialized content for NSW Maths and English High School syllabus",
        "Thinking skills specialist for OC and Selective"

      ]
    },
    {
      icon: GraduationCap,
      title: "Homework Help",
      description: "Get ongoing support between sessions",
      bulletPoints: [
        "UNLIMITED Homework Help between lessons for all subjects",
        "Submit images or questions as often as you like",
        "Detailed step-by-step video solutions on-demand",
        "Quick response within 24 hours",
        "Access to an extensive library of practice problems and resources"
      ]
    }
  ];

  return (
    <section className="py-20">
      <div className="container">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Getting started is simple. Follow these three easy steps
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
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
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {step.description}
                  </p>

                  {/* Bullet Points */}
                  <ul className="text-left text-sm text-muted-foreground space-y-2">
                    {step.bulletPoints.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start">
                        <span className="text-primary mr-2 mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}