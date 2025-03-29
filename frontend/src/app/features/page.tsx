import Link from 'next/link';
import Image from 'next/image';
import { FiLayers, FiTrendingUp, FiSmartphone, FiCalendar } from 'react-icons/fi';

export default function Features() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            Lux <span className="text-[#8c66ff]">Features</span>
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-600">
            Discover how our AI transforms your wardrobe into endless outfit possibilities
          </p>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800">Smart Wardrobe Assistant</h2>
            <p className="text-lg mb-6 text-gray-700">
              Lux goes beyond basic recommendations by learning your personal style preferences,
              body type, and even local weather patterns to suggest perfect outfits.
            </p>
            <p className="text-lg mb-6 text-gray-700">
              Our advanced algorithms consider color theory, pattern mixing, and current trends
              to create combinations you might not have thought of yourself.
            </p>
            <div className="flex gap-4">
              <Link
                href="/outfits"
                className="px-6 py-2 rounded-full border border-[#8c66ff] text-[#8c66ff] hover:bg-[#8c66ff] hover:text-white transition-colors"
              >
                See Example Outfits
              </Link>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <Image
              src="/images/features-showcase.png"
              alt="Lux features showcase"
              width={600}
              height={400}
              className="rounded-2xl shadow-lg w-full h-auto"
              priority
            />
          </div>
        </div>

        {/* All Features Grid */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-24">
          <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Wardrobe Organization",
                description: "Categorize and tag all your clothing items automatically",
                icon: <FiLayers className="w-8 h-8 text-[#8c66ff]" />
              },
              {
                title: "Trend Integration",
                description: "Get suggestions based on current fashion trends",
                icon: <FiTrendingUp className="w-8 h-8 text-[#8c66ff]" />
              },
              {
                title: "Mobile Friendly",
                description: "Access your wardrobe and outfits anywhere",
                icon: <FiSmartphone className="w-8 h-8 text-[#8c66ff]" />
              },
              {
                title: "Occasion-Based",
                description: "Special outfits for work, dates, or formal events",
                icon: <FiCalendar className="w-8 h-8 text-[#8c66ff]" />
              },
              {
                title: "Seasonal Adjustments",
                description: "Automatic weather-appropriate recommendations",
                icon: <FiCalendar className="w-8 h-8 text-[#8c66ff]" />
              },
              {
                title: "Style Evolution",
                description: "Tracks how your style changes over time",
                icon: <FiTrendingUp className="w-8 h-8 text-[#8c66ff]" />
              }
            ].map((feature, index) => (
              <div key={index} className="flex items-start p-6 rounded-xl hover:bg-[#8c66ff]/5 transition-colors">
                <div className="mr-4 mt-1">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-[#8c66ff]/5 rounded-2xl p-12">
          <h2 className="text-3xl font-semibold mb-6 text-gray-800">Ready to Experience Lux?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-600">
            Join thousands of users transforming their wardrobe experience
          </p>
          <Link
            href="/upload"
            className="inline-block px-8 py-3 text-lg rounded-full bg-[#8c66ff] text-white hover:bg-[#7b5cf0] transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}