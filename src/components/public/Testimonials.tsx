// src/components/public/Testimonials.tsx
interface TestimonialsProps {
  data: any;
}

export default function Testimonials({ data }: TestimonialsProps) {
  const testimonials = data?.testimonials || data?.items || [];

  if (!testimonials || testimonials.length === 0) {
    return null; // Don't render if no testimonials
  }

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear from satisfied clients
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial: any, index: number) => (
            <div
              key={testimonial.id || index}
              className="bg-gray-50 p-8 rounded-xl shadow-lg"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, starIndex) => (
                  <span key={starIndex} className="text-yellow-400 text-lg">
                    ★
                  </span>
                ))}
              </div>
              <blockquote className="text-gray-600 italic mb-6 leading-relaxed">
                "{testimonial.comment || testimonial.text || testimonial.review}
                "
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-gray-600 font-semibold">
                    {testimonial.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <cite className="font-semibold text-gray-900">
                    {testimonial.name}
                  </cite>
                  {testimonial.title && (
                    <p className="text-sm text-gray-600">{testimonial.title}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
