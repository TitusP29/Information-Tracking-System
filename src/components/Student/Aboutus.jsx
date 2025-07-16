import React from 'react';
import {
  Building2,
  Target,
  Users,
  Lightbulb,
  Award,
  Globe,
  Leaf,
  Heart,
  Star,
  Zap,
  BookOpen,
  GraduationCap
} from 'lucide-react';

function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl shadow-2xl">
              <Building2 className="text-white" size={48} />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-blue-800 dark:from-slate-100 dark:to-blue-100 mb-4">
            About The GAS
          </h1>
          <h2 className="text-3xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
            GRACE Artisan School
          </h2>
          <p className="text-xl text-blue-600 dark:text-blue-400 italic font-medium max-w-3xl mx-auto">
            Shape the future of clean energy at the GRACE Artisan School (G.A.S).
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* About Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
                  <Globe className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">About G.A.S</h3>
                  <p className="text-slate-600 dark:text-slate-400">Our commitment to excellence</p>
                </div>
              </div>
              
              <div className="space-y-6 text-lg leading-relaxed">
                <p className="text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">GRACE Artisan School (G.A.S)</span> is a Quality Council for Trades and Occupations accredited and the Energy & Water SETA aligned institution offering training & NQF certifications to build Artisan skills in the energy sector.
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  Our programmes equip Artisans to work towards becoming 21st century global leaders, from securing market-relevant skills, global employment, to designing, installing, and maintaining renewable energy systems in sustainable industrialization projects.
                </p>
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-center">
                  <p className="text-white font-bold text-xl">
                    Join us, and build a sustainable tomorrow.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Philosophy Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 h-fit">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                  <Heart className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Our Philosophy</h3>
                  <p className="text-slate-600 dark:text-slate-400">What drives us forward</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
                  <h4 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">What Drives Us</h4>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xl">Global Human Development</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vision, Mission, Values Section */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
              <Target className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Institution Profile</h2>
              <p className="text-slate-600 dark:text-slate-400">Our core principles and values</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Vision */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <Target className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300">Our Vision</h3>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
                Forge the 21st Century Global Energy Leaders
              </p>
            </div>

            {/* Mission */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                  <BookOpen className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-300">Our Mission</h3>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
                Deliver Programmes that Contribute to Global Human Development.
              </p>
            </div>

            {/* Values */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Star className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300">Our Values</h3>
              </div>
              <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">Community - Collaboration</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="font-medium">Innovation - Excellence</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="font-medium">Sustainability - Mastery</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <Award className="text-white" size={20} />
              </div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">Accredited</h4>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Quality Council for Trades and Occupations accredited institution
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <Zap className="text-white" size={20} />
              </div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">Energy Focused</h4>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Specialized in renewable energy systems and sustainable solutions
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Users className="text-white" size={20} />
              </div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">Global Leaders</h4>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Developing 21st century global energy leaders and artisans
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                <Leaf className="text-white" size={20} />
              </div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">Sustainable</h4>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Committed to building a sustainable tomorrow through education
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs; 