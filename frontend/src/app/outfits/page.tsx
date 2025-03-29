import Link from 'next/link';
import Image from 'next/image';
import { FiUpload, FiStar, FiCalendar, FiGrid } from 'react-icons/fi';

export default function Outfits() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            Your <span className="text-[#8c66ff]">Outfits</span>
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-600">
            AI-generated outfit combinations tailored to your unique style
          </p>
        </div>

        {/* Outfit Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <Image
                src={`/images/outfit-${item}.jpg`}
                alt={`Outfit combination ${item}`}
                width={600}
                height={400}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium text-gray-800">Casual Day Out</h3>
                  <span className="bg-[#8c66ff]/10 text-[#8c66ff] px-3 py-1 rounded-full text-sm">Work</span>
                </div>
                <p className="text-gray-600 mb-4">Perfect for office meetings or coffee dates</p>
                <button className="w-full py-2 rounded-full border border-[#8c66ff] text-[#8c66ff] hover:bg-[#8c66ff] hover:text-white transition-colors">
                  Save Outfit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-16">
          <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">Create Perfect Outfits</h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: "1. Upload Items",
                description: "Add your clothing pieces to your digital wardrobe",
                icon: <FiUpload className="w-8 h-8 mx-auto text-[#8c66ff]" />
              },
              {
                title: "2. Set Preferences",
                description: "Tell us your style, occasions, and comfort level",
                icon: <FiStar className="w-8 h-8 mx-auto text-[#8c66ff]" />
              },
              {
                title: "3. Get Outfits",
                description: "Receive daily curated outfit suggestions",
                icon: <FiGrid className="w-8 h-8 mx-auto text-[#8c66ff]" />
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:bg-[#8c66ff]/5 transition-colors border border-gray-100">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-semibold mb-6 text-gray-800">Need More Outfit Ideas?</h2>
          <Link
            href="/upload"
            className="inline-block px-8 py-3 text-lg rounded-full bg-[#8c66ff] text-white hover:bg-[#7b5cf0] transition-colors"
          >
            Add More Clothes
          </Link>
        </div>
      </div>
    </div>
  );
}