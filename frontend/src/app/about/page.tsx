import Link from 'next/link';
import Image from 'next/image';
import { FiUpload, FiCpu, FiStar, FiUser, FiCode, FiSmile } from 'react-icons/fi';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            About <span className="text-[#8c66ff]">Lux</span>
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-600">
            Revolutionizing personal style through AI-powered wardrobe recommendations
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800">Our Vision</h2>
            <p className="text-lg mb-6 text-gray-700">
              At Lux, we're transforming how people interact with their wardrobes. Our AI-powered platform 
              eliminates the frustration of "I have nothing to wear" by intelligently combining your 
              existing clothes into fresh, stylish outfits.
            </p>
            <p className="text-lg mb-6 text-gray-700">
              We combine computer vision with fashion expertise to understand your unique style, 
              body type, and preferences, delivering personalized recommendations that make you 
              look and feel your best.
            </p>
            <div className="flex gap-4">
              <Link
                href="/features"
                className="px-6 py-2 rounded-full border border-[#8c66ff] text-[#8c66ff] hover:bg-[#8c66ff] hover:text-white transition-colors"
              >
                Explore Features
              </Link>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <Image
              src="/images/about-fashion.png"
              alt="Wardrobe organization"
              width={600}
              height={400}
              className="rounded-2xl shadow-lg w-full h-auto"
              priority
            />
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-24">
          <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">How Lux Works</h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: "1. Upload Your Items",
                description: "Snap photos of your clothing or connect your digital wardrobe. Our AI identifies each piece automatically.",
                icon: <FiUpload className="w-8 h-8 mx-auto text-[#8c66ff]" />
              },
              {
                title: "2. AI Style Analysis",
                description: "We analyze colors, patterns, fabrics and styles to build your unique fashion profile.",
                icon: <FiCpu className="w-8 h-8 mx-auto text-[#8c66ff]" />
              },
              {
                title: "3. Personalized Outfits",
                description: "Get daily recommendations tailored to weather, occasion, and your personal taste.",
                icon: <FiStar className="w-8 h-8 mx-auto text-[#8c66ff]" />
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="text-center p-6 rounded-xl hover:bg-[#8c66ff]/5 transition-colors border border-gray-100"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-24">
          <h2 className="text-3xl font-semibold mb-12 text-center text-gray-800">The Minds Behind Lux</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Chen",
                role: "AI Fashion Expert",
                bio: "Combines tech and trend forecasting to create our style algorithms.",
                icon: <FiUser className="w-6 h-6 text-[#8c66ff]" />
              },
              {
                name: "Samira Khan",
                role: "Lead Developer",
                bio: "Builds the systems that power your personalized recommendations.",
                icon: <FiCode className="w-6 h-6 text-[#8c66ff]" />
              },
              {
                name: "Jordan Taylor",
                role: "User Experience",
                bio: "Ensures Lux is intuitive and delightful to use every day.",
                icon: <FiSmile className="w-6 h-6 text-[#8c66ff]" />
              }
            ].map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#8c66ff]/10 flex items-center justify-center text-[#8c66ff]">
                  {member.icon}
                </div>
                <h3 className="text-xl font-medium text-gray-800">{member.name}</h3>
                <p className="text-[#8c66ff] mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-[#8c66ff]/5 rounded-2xl p-12">
          <h2 className="text-3xl font-semibold mb-6 text-gray-800">Ready to Revolutionize Your Wardrobe?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-600">
            Join thousands of users who never struggle with outfit decisions again.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/upload"
              className="px-8 py-3 text-lg rounded-full bg-[#8c66ff] text-white hover:bg-[#7b5cf0] transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/features"
              className="px-8 py-3 text-lg rounded-full border border-[#8c66ff] text-[#8c66ff] hover:bg-[#8c66ff] hover:text-white transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}