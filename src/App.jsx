import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Search, 
  Zap, 
  BookOpen, 
  TrendingUp, 
  MessageCircle, 
  Share2, 
  Menu, 
  X, 
  Sparkles,
  Shuffle,
  Info,
  Flame,
  Globe,
  Database,
  User,
  Heart,
  Award,
  PlusCircle,
  AlertTriangle,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Code,
  Loader,
  Shield,
  FileText,
  Users,
  LogIn
} from 'lucide-react';

// --- API CONFIGURATION ---
const apiKey = "AIzaSyAbnODoFsTup8LnuIjV-NrgkVAV-eGKCXY"; // Your Gemini API Key should be here

// --- AI LOGIC ---
const fetchAiSlang = async (term) => {
  // Use exponential backoff for retries
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are SlanzG AI. Define the slang term "${term}" using this exact JSON structure:
                {
                  "term": "${term}",
                  "short_definition": "<1-line meaning>",
                  "long_definition": "<detailed meaning>",
                  "examples": [
                    {"text": "...", "context": "..."}
                  ],
                  "confidence": "<low|medium|high>",
                  "source_suggestion": "TikTok / Twitter / AAVE / unknown",
                  "category": "<one word category>",
                  "tags": ["<tag1>", "<tag2>"]
                }
                Return ONLY valid JSON. No markdown.`
              }]
            }]
          })
        }
      );

      // Check for success status codes
      if (!response.ok) {
        if (response.status === 429 && i < 2) {
          // Retry after delay for rate limiting
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
          continue;
        }
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) return null;
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    } catch (error) {
      console.error(`Attempt ${i + 1} failed: AI Fetch Error:`, error);
      if (i === 2) return null; // Only return null after the final retry
    }
  }
};

// --- MOCK DATABASE ---
const SLANG_DATABASE = [
  { id: 1, term: "Rizz", category: "Dating", short_definition: "Charisma/Charm", long_definition: "Short for 'charisma'. The ability to attract a romantic partner effortlessly.", examples: [{text: "He has unspoken rizz.", context: "Social"}], tags: ["Viral", "W"], popularity: 99, upvotes: 1240 },
  { id: 2, term: "No Cap", category: "General", short_definition: "No lie / For real", long_definition: "Used to emphasize that a statement is completely true.", examples: [{text: "That food was amazing, no cap.", context: "Dining"}], tags: ["Truth", "Emphasis"], popularity: 95, upvotes: 980 },
  { id: 3, term: "Fanum Tax", category: "Food", short_definition: "Food theft between friends", long_definition: "Taking a portion of someone's food, popularized by streamer Fanum.", examples: [{text: "Let me get that Fanum tax on those fries.", context: "Friendship"}], tags: ["Twitch", "Kai Cenat"], popularity: 97, upvotes: 850 },
  { id: 4, term: "Ohio", category: "Internet", short_definition: "Weird/Chaotic", long_definition: "Adjective for anything bizarre, monster-filled, or unexplainable.", examples: [{text: "Only in Ohio.", context: "Memes"}], tags: ["Memes", "Geography"], popularity: 94, upvotes: 720 },
  { id: 5, term: "Girl Math", category: "Lifestyle", short_definition: "Justification logic", long_definition: "Logic used to justify spending money (e.g., 'If I pay cash, it's free').", examples: [{text: "It was on sale so I basically made money. Girl math.", context: "Shopping"}], tags: ["TikTok", "Humor"], popularity: 93, upvotes: 1100 },
  { id: 6, term: "Glazed", category: "Social", short_definition: "Sucking up/Complimenting", long_definition: "To compliment someone excessively to the point of annoyance.", examples: [{text: "Stop glazing him, he's not that funny.", context: "Social"}], tags: ["Annoying", "L"], popularity: 90, upvotes: 600 },
];

const COLLECTIONS = [
  { name: "Internet Culture", icon: Globe, color: "bg-blue-100 text-blue-600" },
  { name: "Reactions", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
  { name: "Roasts", icon: Flame, color: "bg-red-100 text-red-600" },
  { name: "Relationships", icon: Heart, color: "bg-pink-100 text-pink-600" },
];

// --- COMPONENTS (Unchanged for stability) ---

const Header = ({ setView, activeView, onLoginClick, isLoggedIn }) => (
  <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-4 md:px-8 bg-[#FAFAFC]/90 backdrop-blur-md border-b border-gray-100">
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
      <div className="w-8 h-8 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white font-bold font-heading text-lg">S</div>
      <span className="font-heading font-bold text-xl tracking-tight text-[#0F172A]">Slanz<span className="text-[#7C3AED]">G</span></span>
    </div>
    
    <div className="hidden md:flex gap-8 font-medium text-sm text-[#6B7280]">
      {['Home', 'Explore', 'Community', 'About'].map(item => (
        <button 
          key={item} 
          onClick={() => setView(item.toLowerCase())}
          className={`hover:text-[#7C3AED] transition-colors ${activeView === item.toLowerCase() ? 'text-[#7C3AED] font-semibold' : ''}`}
        >
          {item}
        </button>
      ))}
    </div>

    <div className="flex items-center gap-3">
      <button 
        onClick={() => setView('add')}
        className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white rounded-xl font-semibold text-sm hover:bg-[#6D28D9] transition-colors shadow-lg shadow-purple-200"
      >
        <PlusCircle size={16} /> Submit Slang
      </button>
      
      {isLoggedIn ? (
        <button 
          onClick={() => setView('profile')}
          className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 overflow-hidden hover:ring-2 ring-[#7C3AED] transition-all"
        >
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=SlanzGUser" alt="User" />
        </button>
      ) : (
        <button 
          onClick={onLoginClick}
          className="flex items-center gap-2 px-4 py-2 text-[#7C3AED] font-bold text-sm hover:bg-purple-50 rounded-xl transition-colors"
        >
          <LogIn size={16} /> Login
        </button>
      )}
    </div>
  </header>
);

const SlangCard = ({ item, onClick, isAiGenerated = false }) => (
  <div 
    onClick={() => onClick(item)}
    className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:translate-y-[-4px] hover:shadow-md transition-all cursor-pointer h-full flex flex-col relative overflow-hidden ${isAiGenerated ? 'ring-2 ring-[#00D1B2]' : ''}`}
  >
    {isAiGenerated && (
      <div className="absolute top-0 right-0 bg-[#00D1B2] text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
        AI Generated
      </div>
    )}
    
    <div className="flex justify-between items-start mb-2">
      <span className="bg-[#EEF2FF] text-[#7C3AED] rounded-full px-3 py-1 text-xs font-bold">{item.category || "General"}</span>
      <div className="flex items-center gap-1 text-xs font-semibold text-gray-400">
        <Flame size={12} className={item.popularity > 90 ? "text-[#FF6B6B]" : ""} /> 
        {item.popularity || 50}
      </div>
    </div>
    
    <h3 className="font-heading font-bold text-2xl text-[#0F172A] mb-2">{item.term}</h3>
    <p className="text-[#6B7280] text-sm line-clamp-2 mb-4 flex-grow">{item.short_definition || item.definition}</p>
    
    <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <ThumbsUp size={14} /> {item.upvotes || 0}
      </div>
      <span className="text-[#7C3AED] text-xs font-bold flex items-center gap-1 group">
        View Details <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
      </span>
    </div>
  </div>
);

const HomeView = ({ onSearch, featuredTerms, setView, setSelectedSlang }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-[#7C3AED] text-xs font-bold mb-6 border border-purple-100">
          <Sparkles size={12} /> Powered by Gen-Z AI
        </div>
        <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-[#0F172A] mb-6 tracking-tight leading-[1.1]">
          Speak <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#00D1B2]">Gen-Z</span> Fluently.
        </h1>
        <p className="text-[#6B7280] text-lg mb-10 max-w-2xl mx-auto">
          The ultimate AI-powered slang dictionary. Search definitions, explore trends, or ask our AI to decode the indecipherable.
        </p>

        {/* Big Search Bar */}
        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto mb-12 group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#00D1B2] rounded-2xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
          <div className="relative flex items-center bg-white rounded-2xl shadow-xl p-2 border border-gray-100">
            <Search className="ml-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search terms like 'Rizz', 'Glazed', 'Ohio'..." 
              className="w-full p-4 outline-none text-[#0F172A] font-medium placeholder:text-gray-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="bg-[#0F172A] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#7C3AED] transition-colors">
              Search
            </button>
          </div>
        </form>

        {/* Collections Chips */}
        <div className="flex flex-wrap justify-center gap-3">
          {COLLECTIONS.map(col => (
             <button key={col.name} className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-transform hover:scale-105 ${col.color}`}>
               <col.icon size={14} /> {col.name}
             </button>
          ))}
        </div>
      </section>

      {/* Slang of the Day & Trending */}
      <section className="max-w-7xl mx-auto px-4 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-[#7C3AED] rounded-3xl p-8 text-white relative overflow-hidden h-full shadow-2xl shadow-purple-200 flex flex-col justify-between">
            <div className="relative z-10">
               <div className="flex items-center gap-2 text-purple-200 font-bold text-xs uppercase tracking-widest mb-4">
                 <Zap size={14} /> Slang of the Day
               </div>
               <h2 className="text-4xl font-heading font-bold mb-2">Girl Math</h2>
               <p className="text-purple-100 mb-6 text-sm">Logic used to justify spending money.</p>
               <button onClick={() => {onSearch("Girl Math")}} className="bg-white text-[#7C3AED] px-6 py-3 rounded-xl font-bold text-sm w-full hover:bg-purple-50 transition-colors">
                 Learn More
               </button>
            </div>
            {/* Abstract Shapes */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#00D1B2] rounded-full blur-3xl opacity-50"></div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-heading font-bold text-[#0F172A]">Trending Now</h3>
            <button onClick={() => setView('explore')} className="text-[#7C3AED] font-bold text-sm hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {featuredTerms.slice(0, 4).map(term => (
               <SlangCard key={term.id} item={term} onClick={setSelectedSlang} />
             ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const ExploreView = ({ featuredTerms, setSelectedSlang }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-heading font-bold text-[#0F172A] mb-4">Explore the Dictionary</h2>
        <p className="text-[#6B7280]">Browse the full collection of Gen-Z vernacular.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {featuredTerms.map(term => (
          <SlangCard key={term.id} item={term} onClick={setSelectedSlang} />
        ))}
      </div>
    </div>
  );
};

const CommunityView = ({ setView }) => (
  <div className="max-w-5xl mx-auto px-4 py-12 animate-in fade-in duration-500">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-heading font-bold text-[#0F172A] mb-4">SlanzG Community</h2>
      <p className="text-[#6B7280]">Top contributors and leaderboard.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="font-heading font-bold text-2xl text-[#7C3AED]">#{i}</div>
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`} className="w-12 h-12 rounded-full" alt="User" />
          <div>
            <h4 className="font-bold text-[#0F172A]">SlangMaster_{i}</h4>
            <p className="text-xs text-[#6B7280]">1,540 XP • 42 Contributions</p>
          </div>
        </div>
      ))}
    </div>
    
    <div className="mt-12 bg-purple-50 rounded-3xl p-8 text-center">
      <h3 className="text-2xl font-heading font-bold text-[#7C3AED] mb-4">Join the Movement</h3>
      <p className="text-[#6B7280] mb-6">Contribute new slang terms and earn badges.</p>
      <button 
        onClick={() => setView('add')}
        className="bg-[#7C3AED] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#6D28D9] transition-colors"
      >
        Start Contributing
      </button>
    </div>
  </div>
);

const DetailView = ({ slang, onBack }) => {
  if (!slang) return null;

  const isAi = slang.isAiGenerated;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="mb-8 text-[#6B7280] font-medium hover:text-[#0F172A] flex items-center gap-2">
        <ArrowRight className="rotate-180" size={16} /> Back to Search
      </button>

      {isAi && (
        <div className="bg-[#00D1B2]/10 border border-[#00D1B2]/30 text-[#007b69] px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
          <Sparkles size={20} />
          <div>
            <p className="font-bold text-sm">AI Generated Definition</p>
            <p className="text-xs opacity-80">This slang was not in our database, so we generated it for you. {slang.confidence && `Confidence: ${slang.confidence}`}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[#EEF2FF] text-[#7C3AED] rounded-full px-3 py-1 text-xs font-bold">{slang.category || "General"}</span>
              <span className="text-xs font-bold text-gray-400">ID: #{slang.id || "AI"}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-heading font-extrabold text-[#0F172A] mb-4">{slang.term}</h1>
            <p className="text-xl md:text-2xl text-[#6B7280] font-medium">{slang.short_definition}</p>
          </div>
          
          <div className="flex gap-2">
            <button className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors">
               <ThumbsUp size={20} />
               <span className="text-xs font-bold mt-1">{slang.upvotes || 0}</span>
            </button>
            <button className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
               <ThumbsDown size={20} />
            </button>
             <button className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
               <Share2 size={20} />
            </button>
          </div>
        </div>

        <div className="prose prose-lg text-[#0F172A] mb-10">
          <h3 className="font-heading font-bold text-lg mb-2">Full Definition</h3>
          <p className="leading-relaxed">{slang.long_definition || slang.definition}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
           {(slang.examples || []).map((ex, i) => (
             <div key={i} className="bg-[#FAFAFC] p-6 rounded-2xl border-l-4 border-[#7C3AED]">
               <p className="font-medium italic text-[#0F172A] mb-2">"{ex.text}"</p>
               {ex.context && <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Context: {ex.context}</p>}
             </div>
           ))}
        </div>

        {/* Community Actions */}
        <div className="flex flex-wrap gap-4 pt-8 border-t border-gray-100">
           <button className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 flex items-center gap-2">
             <AlertTriangle size={16} /> Report
           </button>
           <button className="px-4 py-2 rounded-lg text-sm font-bold text-[#7C3AED] hover:bg-purple-50 flex items-center gap-2">
             <Code size={16} /> Contribute Update
           </button>
        </div>
      </div>
    </div>
  );
};

const DatabaseInfo = () => (
  <div className="max-w-5xl mx-auto px-4 py-12">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-heading font-bold mb-4">How SlanzG Works</h2>
      <p className="text-gray-500 max-w-2xl mx-auto">A transparent look at our database schema and AI integration logic.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Database Schema Card */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
           <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Database size={24}/></div>
           <h3 className="font-heading font-bold text-xl">SQL Schema</h3>
        </div>
        
        <div className="space-y-6">
           {[
             { table: "users", fields: "id, email, password_hash, display_name, role, xp" },
             { table: "slang_terms", fields: "id, term, definition, examples[], tags[], popularity" },
             { table: "submissions", fields: "id, user_id, term_candidate, status" },
             { table: "votes", fields: "slang_id, user_id, vote_val" }
           ].map((t) => (
             <div key={t.table}>
               <div className="text-[#7C3AED] font-mono font-bold text-sm mb-1">{t.table}</div>
               <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded border border-gray-100">{t.fields}</div>
             </div>
           ))}
        </div>
      </div>

      {/* AI Logic Card */}
      <div className="bg-[#0F172A] p-8 rounded-3xl text-gray-300 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
           <div className="p-3 bg-[#00D1B2]/20 text-[#00D1B2] rounded-xl"><Sparkles size={24}/></div>
           <h3 className="font-heading font-bold text-xl text-white">AI Neural Fallback</h3>
        </div>
        <p className="text-sm mb-4">When a search fails, we trigger this prompt structure:</p>
        <div className="bg-black/50 p-4 rounded-xl font-mono text-xs text-[#00D1B2] overflow-x-auto border border-white/10">
          <pre>{`{
  "term": "<normalized_term>",
  "short_definition": "<1-line>",
  "long_definition": "<detailed>",
  "examples": [
    {"text": "...", "context": ""}
  ],
  "confidence": "<low|medium|high>",
  "source_suggestion": "TikTok/Twitter"
}`}</pre>
        </div>
      </div>
    </div>
  </div>
);

const UserProfile = () => (
  <div className="max-w-3xl mx-auto px-4 py-12">
     <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
        <div className="relative">
           <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=SlanzGUser" className="w-32 h-32 rounded-full border-4 border-white shadow-lg" alt="Profile"/>
           <div className="absolute bottom-0 right-0 bg-[#00D1B2] text-white p-2 rounded-full border-2 border-white"><Award size={16}/></div>
        </div>
        
        <div className="flex-1">
           <h2 className="text-3xl font-heading font-bold mb-2">CoolUser_99</h2>
           <p className="text-gray-500 mb-4">Joined September 2024 • Slang Connoisseur</p>
           
           <div className="flex gap-4 justify-center md:justify-start">
              <div className="bg-purple-50 px-4 py-2 rounded-xl border border-purple-100">
                 <span className="block font-bold text-[#7C3AED] text-xl">1,250</span>
                 <span className="text-xs text-purple-400 font-bold uppercase">XP Earned</span>
              </div>
               <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                 <span className="block font-bold text-orange-500 text-xl">12</span>
                 <span className="text-xs text-orange-400 font-bold uppercase">Streak</span>
              </div>
           </div>
        </div>
     </div>

     <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100">
           <h3 className="font-bold font-heading mb-4">Saved Slang</h3>
           <div className="space-y-2">
              {["Girl Math", "Rizz", "Ohio"].map(t => (
                 <div key={t} className="flex justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <span className="font-medium">{t}</span>
                    <ArrowRight size={16} className="text-gray-300"/>
                 </div>
              ))}
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100">
           <h3 className="font-bold font-heading mb-4">My Contributions</h3>
           <div className="flex items-center gap-3 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm mb-2">
              <AlertTriangle size={16}/> "Skibidi" (Pending Review)
           </div>
           <div className="flex items-center gap-3 p-3 bg-green-50 text-green-800 rounded-lg text-sm">
              <CheckCircle size={16}/> "Glow Up" (Approved)
           </div>
        </div>
     </div>
  </div>
);

const AddSlangForm = () => (
  <div className="max-w-2xl mx-auto px-4 py-12">
     <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-sm">
        <h2 className="text-3xl font-heading font-bold mb-2">Submit New Slang</h2>
        <p className="text-gray-500 mb-8">Help us keep the dictionary fresh. All submissions are reviewed by moderators.</p>
        
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Submission sent to moderation queue!"); }}>
           <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">Slang Term</label>
              <input type="text" className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 outline-none transition-all font-bold" placeholder="e.g. Delulu" />
           </div>
           <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">Definition</label>
              <textarea className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 outline-none transition-all" rows="3" placeholder="What does it mean?"></textarea>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-bold text-[#0F172A] mb-2">Category</label>
                 <select className="w-full p-3 rounded-xl border border-gray-200 outline-none bg-white">
                    <option>General</option>
                    <option>Internet</option>
                    <option>Gaming</option>
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-bold text-[#0F172A] mb-2">Tags</label>
                 <input type="text" className="w-full p-3 rounded-xl border border-gray-200 outline-none" placeholder="viral, tiktok" />
              </div>
           </div>
           <button className="w-full bg-[#7C3AED] text-white font-bold py-4 rounded-xl hover:bg-[#6D28D9] transition-colors shadow-lg shadow-purple-100">
              Submit for Approval
           </button>
        </form>
     </div>
  </div>
);

const TextPage = ({ title, content }) => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-sm">
      <h1 className="text-3xl font-heading font-bold mb-6">{title}</h1>
      <div className="prose text-[#6B7280] space-y-4 whitespace-pre-line">
        {content}
      </div>
    </div>
  </div>
);

const LoginModal = ({ onClose, onLogin }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl p-8 w-full max-w-md relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-[#0F172A]">
        <X size={24} />
      </button>
      
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-[#7C3AED] rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">S</div>
        <h2 className="text-2xl font-bold font-heading">Welcome Back</h2>
        <p className="text-gray-500 text-sm">Login to save slang and contribute.</p>
      </div>

      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
        <input type="email" placeholder="Email" className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#7C3AED] outline-none" />
        <input type="password" placeholder="Password" className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#7C3AED] outline-none" />
        <button className="w-full bg-[#7C3AED] text-white font-bold py-3 rounded-xl hover:bg-[#6D28D9] transition-colors">Log In</button>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        Don't have an account? <span className="text-[#7C3AED] font-bold cursor-pointer">Sign Up</span>
      </div>
    </div>
  </div>
);

// --- MAIN APP SHELL ---

const App = () => {
  const [view, setView] = useState('home');
  const [selectedSlang, setSelectedSlang] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Sorting trending
  const trendingTerms = useMemo(() => {
     return [...SLANG_DATABASE].sort((a,b) => b.popularity - a.popularity);
  }, []);

  const handleSearch = async (query) => {
    if (!query) return;
    
    setView('search_loading');
    
    // 1. Local Search
    const lowerQ = query.toLowerCase();
    const local = SLANG_DATABASE.filter(item => 
      item.term.toLowerCase().includes(lowerQ) || 
      item.short_definition.toLowerCase().includes(lowerQ)
    );

    if (local.length > 0) {
      setSearchResults(local);
      setView('results');
    } else {
      // 2. AI Fallback
      setIsAiLoading(true);
      const aiResponse = await fetchAiSlang(query);
      setIsAiLoading(false);
      
      if (aiResponse) {
        // Normalize AI response to match our internal schema
        const normalized = {
           id: "AI_" + Date.now(),
           ...aiResponse,
           isAiGenerated: true,
           popularity: 50, // Default for new
           upvotes: 0
        };
        setSelectedSlang(normalized);
        setView('detail');
      } else {
        setSearchResults([]);
        setView('results');
      }
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'home':
        return <HomeView onSearch={handleSearch} featuredTerms={trendingTerms} setView={setView} setSelectedSlang={(s) => { setSelectedSlang(s); setView('detail'); }} />;
      case 'search_loading':
        return (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
             <div className="w-16 h-16 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-gray-500 font-medium animate-pulse">Scanning Slang Database...</p>
          </div>
        );
      case 'results':
        return (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-heading font-bold mb-8">Search Results</h2>
            {searchResults.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {searchResults.map(s => <SlangCard key={s.id} item={s} onClick={(item) => { setSelectedSlang(item); setView('detail'); }} />)}
               </div>
            ) : (
               <div className="text-center py-20 bg-gray-50 rounded-3xl">
                  <p className="text-xl font-bold text-gray-400 mb-4">No results found in local database.</p>
                  <p className="text-gray-500">The AI failed to generate a definition or the API key is missing.</p>
               </div>
            )}
          </div>
        );
      case 'detail':
        return <DetailView slang={selectedSlang} onBack={() => setView('home')} />;
      case 'explore':
        return <ExploreView featuredTerms={trendingTerms} setSelectedSlang={(s) => { setSelectedSlang(s); setView('detail'); }} />;
      case 'community':
        return <CommunityView setView={setView} />;
      case 'about':
        return <DatabaseInfo />;
      case 'profile':
        return <UserProfile />;
      case 'add':
        return <AddSlangForm />;
      case 'terms':
        return <TextPage title="Terms of Service" content={`Last Updated: January 2025\n\n1. Acceptance of Terms\nBy accessing SlanzG, you agree to these terms. We are a community-driven platform.\n\n2. User Conduct\nDo not post hate speech, harassment, or illegal content. We have zero tolerance for toxicity.`} />;
      case 'privacy':
        return <TextPage title="Privacy Policy" content={`Last Updated: January 2025\n\nWe respect your privacy. We collect minimal data (email for login, usage stats for trending algorithms).\n\nWe do not sell your data to third parties. AI queries are processed anonymously.`} />;
      case 'guidelines':
        return <TextPage title="Community Guidelines" content={`Keep it Based.\n\n1. Be accurate. Don't make up slang just to be funny.\n2. Provide context. Where is this used? TikTok? Twitch?\n3. Respect origins. Acknowledge if a term comes from AAVE, LGBTQ+ culture, etc.`} />;
      default:
        return <HomeView onSearch={handleSearch} featuredTerms={trendingTerms} setView={setView} setSelectedSlang={(s) => { setSelectedSlang(s); setView('detail'); }} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        setView={setView} 
        activeView={view} 
        onLoginClick={() => setShowLogin(true)} 
        isLoggedIn={isLoggedIn} 
      />
      
      <main className="flex-grow">
        {renderContent()}
      </main>
      
      <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
         <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
               <span className="font-heading font-bold text-xl text-[#0F172A]">Slanz<span className="text-[#7C3AED]">G</span></span>
               <p className="text-sm text-gray-500 mt-2">© 2025 SlanzG Inc. Stay Based.</p>
            </div>
            <div className="flex gap-6 text-sm font-medium text-gray-500">
               <button onClick={() => setView('terms')} className="hover:text-[#7C3AED]">Terms</button>
               <button onClick={() => setView('privacy')} className="hover:text-[#7C3AED]">Privacy</button>
               <button onClick={() => setView('guidelines')} className="hover:text-[#7C3AED]">Guidelines</button>
            </div>
         </div>
      </footer>

      {showLogin && (
        <LoginModal 
          onClose={() => setShowLogin(false)} 
          onLogin={() => { setIsLoggedIn(true); setShowLogin(false); }} 
        />
      )}
    </div>
  );
};

// --- MOUNTING THE APP ---
const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(<App />);
}