import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw
} from 'lucide-react';

// --- API CONFIGURATION ---
// We use a safe access pattern for environment variables to prevent compilation warnings
// in certain build environments while still allowing Netlify/Vite to inject the secret.
const getApiKey = () => {
  try {
    return import.meta.env.VITE_GEMINI_API_KEY || "";
  } catch (e) {
    // Fallback for non-ESM environments or older build targets
    return "";
  }
};

const apiKey = getApiKey();

// --- AI LOGIC ---
const fetchAiSlang = async (term) => {
  if (!apiKey) {
    console.error("API Key missing. Please check Netlify Environment Variables.");
    return null;
  }
  
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

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) return null;
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("AI Fetch Error:", error);
    return null;
  }
};

// --- STYLES & THEME ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

  :root {
    --primary: #7C3AED; 
    --secondary: #00D1B2; 
    --accent: #FF6B6B; 
    --bg-main: #FAFAFC; 
    --bg-card: #FFFFFF;
    --text-main: #0F172A; 
    --text-muted: #6B7280; 
    --badge-bg: #EEF2FF; 
  }

  body {
    background-color: var(--bg-main);
    color: var(--text-main);
    font-family: 'Inter', sans-serif;
  }

  h1, h2, h3, h4, .font-heading {
    font-family: 'Poppins', sans-serif;
  }

  .hover-lift {
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease;
  }
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.15), 0 8px 10px -6px rgba(124, 58, 237, 0.1);
  }

  .pill-tag {
    background-color: var(--badge-bg);
    color: var(--primary);
    border-radius: 9999px;
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .glass-header {
    background: rgba(250, 250, 252, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }
`;

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

// --- COMPONENTS ---
const Header = ({ setView, activeView }) => (
  <header className="glass-header sticky top-0 z-50 h-16 flex items-center justify-between px-4 md:px-8">
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
      <button 
        onClick={() => setView('profile')}
        className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 overflow-hidden hover:ring-2 ring-[#7C3AED] transition-all"
      >
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=SlanzGUser" alt="User" />
      </button>
    </div>
  </header>
);

const SlangCard = ({ item, onClick, isAiGenerated = false }) => (
  <div 
    onClick={() => onClick(item)}
    className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover-lift cursor-pointer h-full flex flex-col relative overflow-hidden ${isAiGenerated ? 'ring-2 ring-[#00D1B2]' : ''}`}
  >
    {isAiGenerated && (
      <div className="absolute top-0 right-0 bg-[#00D1B2] text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
        AI Generated
      </div>
    )}
    
    <div className="flex justify-between items-start mb-2">
      <span className="pill-tag">{item.category || "General"}</span>
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

        <div className="flex flex-wrap justify-center gap-3">
          {COLLECTIONS.map(col => (
             <button key={col.name} className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-transform hover:scale-105 ${col.color}`}>
               <col.icon size={14} /> {col.name}
             </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-[#7C3AED] rounded-3xl p-8 text-white relative overflow-hidden h-full shadow-2xl shadow-purple-200">
            <div className="relative z-10">
               <div className="flex items-center gap-2 text-purple-200 font-bold text-xs uppercase tracking-widest mb-4">
                 <Zap size={14} /> Slang of the Day
               </div>
               <h2 className="text-4xl font-heading font-bold mb-2">Girl Math</h2>
               <p className="text-purple-100 mb-6 text-sm">Logic used to justify spending money.</p>
               <button onClick={() => onSearch("Girl Math")} className="bg-white text-[#7C3AED] px-6 py-3 rounded-xl font-bold text-sm w-full hover:bg-purple-50 transition-colors">
                 Learn More
               </button>
            </div>
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
            <p className="text-xs opacity-80">Generated by SlanzG AI. {slang.confidence && `Confidence: ${slang.confidence}`}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="pill-tag bg-[#7C3AED]/10 text-[#7C3AED]">{slang.category || "General"}</span>
              <span className="text-xs font-bold text-gray-400">ID: #{slang.id || "AI"}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-heading font-extrabold text-[#0F172A] mb-4">{slang.term}</h1>
            <p className="text-xl md:text-2xl text-[#6B7280] font-medium">{slang.short_definition || slang.definition}</p>
          </div>
          
          <div className="flex gap-2">
            <button className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors">
               <ThumbsUp size={20} />
               <span className="text-xs font-bold mt-1">{slang.upvotes || 0}</span>
            </button>
            <button className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
               <ThumbsDown size={20} />
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
      </div>
    </div>
  );
};

// --- MAIN APP SHELL ---
const App = () => {
  const [view, setView] = useState('home');
  const [selectedSlang, setSelectedSlang] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const trendingTerms = useMemo(() => {
     return [...SLANG_DATABASE].sort((a,b) => b.popularity - a.popularity);
  }, []);

  const handleSearch = async (query) => {
    if (!query) return;
    setView('search_loading');
    
    const lowerQ = query.toLowerCase();
    const local = SLANG_DATABASE.filter(item => 
      item.term.toLowerCase().includes(lowerQ) || 
      item.short_definition.toLowerCase().includes(lowerQ)
    );

    if (local.length > 0) {
      setSearchResults(local);
      setView('results');
    } else {
      setIsAiLoading(true);
      const aiResponse = await fetchAiSlang(query);
      setIsAiLoading(false);
      
      if (aiResponse) {
        const normalized = {
           id: "AI_" + Date.now(),
           ...aiResponse,
           isAiGenerated: true,
           popularity: 50,
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
                  <p className="text-gray-500 italic">Try searching for something else, or check back later!</p>
               </div>
            )}
          </div>
        );
      case 'detail':
        return <DetailView slang={selectedSlang} onBack={() => setView('home')} />;
      default:
        return <HomeView onSearch={handleSearch} featuredTerms={trendingTerms} setView={setView} setSelectedSlang={(s) => { setSelectedSlang(s); setView('detail'); }} />;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen flex flex-col">
        <Header setView={setView} activeView={view} />
        <main className="flex-grow">
          {renderContent()}
        </main>
        
        <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
           <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                 <span className="font-heading font-bold text-xl text-[#0F172A]">Slanz<span className="text-[#7C3AED]">G</span></span>
                 <p className="text-sm text-gray-500 mt-2">© 2026 SlanzG Inc. Stay Based.</p>
              </div>
           </div>
        </footer>
      </div>
    </>
  );
};

export default App;