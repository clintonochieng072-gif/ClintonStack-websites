import React from "react";
import { realEstateDefaults } from "../defaultContent";

export default function RealEstateAdmin() {
  const [content, setContent] = React.useState(realEstateDefaults);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Real Estate Admin</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Hero Title</label>
          <input
            type="text"
            value={content.heroTitle}
            onChange={(e) =>
              setContent({ ...content, heroTitle: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Hero Subtitle
          </label>
          <input
            type="text"
            value={content.heroSubtitle}
            onChange={(e) =>
              setContent({ ...content, heroSubtitle: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">About</label>
          <textarea
            value={content.about}
            onChange={(e) => setContent({ ...content, about: e.target.value })}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Services</label>
          {content.services.map((service, index) => (
            <input
              key={index}
              type="text"
              value={service}
              onChange={(e) => {
                const newServices = [...content.services];
                newServices[index] = e.target.value;
                setContent({ ...content, services: newServices });
              }}
              className="w-full p-2 border rounded mb-2"
            />
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Testimonials</label>
          {content.testimonials.map((testimonial, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <input
                type="text"
                placeholder="Name"
                value={testimonial.name}
                onChange={(e) => {
                  const newTestimonials = [...content.testimonials];
                  newTestimonials[index] = {
                    ...testimonial,
                    name: e.target.value,
                  };
                  setContent({ ...content, testimonials: newTestimonials });
                }}
                className="w-full p-2 border rounded mb-2"
              />
              <textarea
                placeholder="Text"
                value={testimonial.text}
                onChange={(e) => {
                  const newTestimonials = [...content.testimonials];
                  newTestimonials[index] = {
                    ...testimonial,
                    text: e.target.value,
                  };
                  setContent({ ...content, testimonials: newTestimonials });
                }}
                className="w-full p-2 border rounded"
                rows={2}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Footer Text</label>
          <input
            type="text"
            value={content.footerText}
            onChange={(e) =>
              setContent({ ...content, footerText: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
    </div>
  );
}
