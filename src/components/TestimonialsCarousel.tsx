import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    rating: 5,
    comment: "Helped me get into selective school!",
    student: "Mia",
    school: "Year 6"
  },
  {
    id: 2,
    rating: 5,
    comment: "Amazing tutor, really patient and explains everything clearly.",
    student: "James",
    school: "Year 10"
  },
  {
    id: 3,
    rating: 5,
    comment: "My maths grades improved dramatically after just a few sessions.",
    student: "Sarah",
    school: "Year 11"
  },
  {
    id: 4,
    rating: 4,
    comment: "Great preparation for the OC test. Highly recommend!",
    student: "Alex",
    school: "Year 4"
  },
  {
    id: 5,
    rating: 5,
    comment: "Professional and knowledgeable. Worth every dollar.",
    student: "Emma",
    school: "Year 12"
  }
];

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Students Say
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Real feedback from students who've improved their grades
          </p>

          <div className="relative">
            <Card className="max-w-2xl mx-auto shadow-medium">
              <CardContent className="p-8">
                {/* Stars */}
                <div className="flex justify-center mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < currentTestimonial.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-xl md:text-2xl font-medium text-foreground mb-6">
                  "{currentTestimonial.comment}"
                </blockquote>

                {/* Attribution */}
                <div className="text-muted-foreground">
                  <p className="font-semibold">{currentTestimonial.student}</p>
                  <p className="text-sm">{currentTestimonial.school}</p>
                </div>
              </CardContent>
            </Card>

            {/* Navigation buttons */}
            <div className="flex justify-center items-center mt-8 space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={prevTestimonial}
                className="rounded-full p-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Dots indicator */}
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextTestimonial}
                className="rounded-full p-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}