import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Settings, 
  Info, 
  X, 
  Volume2, 
  Sliders, 
  Eye, 
  EyeOff, 
  Languages,
  BookMarked,
  Search,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { chap, suraVerseRanges } from '@/lib/chapterVerse';
import { apiFetch } from '@/services/api.js';
import './EQuran.css';

// Parse surahs from the chap anchors string
const parseSurahs = () => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(chap, 'text/html');
    const anchors = doc.querySelectorAll('a');
    return Array.from(anchors).map(a => ({
      id: parseInt(a.id.replace('s', '')),
      name: a.textContent || ''
    }));
  } catch (error) {
    console.error("Error parsing surahs:", error);
    return [];
  }
};

export function EQuran() {
  const surahs = useMemo(() => parseSurahs(), []);
  
  // Quran navigation state
  const [activeSura, setActiveSura] = useState(1);
  const [activeSegmentIdx, setActiveSegmentIdx] = useState(0);
  
  // Search state for Surahs
  const [surahSearch, setSurahSearch] = useState('');
  
  // Quran content data state
  const [arabicHTML, setArabicHTML] = useState('');
  const [tamilHTML, setTamilHTML] = useState('');
  const [introHTML, setIntroHTML] = useState('');
  const [loading, setLoading] = useState(false);
  const [introLoading, setIntroLoading] = useState(false);
  
  // UI Panels state
  const [showIntro, setShowIntro] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings state (loads from localStorage or defaults)
  const [arabicSize, setArabicSize] = useState(() => {
    return parseInt(localStorage.getItem('quran_arabic_size') || '32');
  });
  const [tamilSize, setTamilSize] = useState(() => {
    return parseInt(localStorage.getItem('quran_tamil_size') || '16');
  });
  const [showArabicText, setShowArabicText] = useState(() => {
    return localStorage.getItem('quran_show_arabic') !== 'false';
  });
  const [showTamilText, setShowTamilText] = useState(() => {
    return localStorage.getItem('quran_show_tamil') !== 'false';
  });

  // Audio recitation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingVerse, setCurrentPlayingVerse] = useState(null);
  const [audioVolume, setAudioVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState('repeat-segment');

  // Ref to audio element
  const audioRef = useRef(null);

  // Filtered surahs based on search query
  const filteredSurahs = useMemo(() => {
    if (!surahSearch.trim()) return surahs;
    const query = surahSearch.toLowerCase().trim();
    return surahs.filter(s => s.name.toLowerCase().includes(query) || s.id.toString() === query);
  }, [surahs, surahSearch]);

  // Sura information
  const currentSurahName = useMemo(() => {
    const s = surahs.find(item => item.id === activeSura);
    return s ? s.name : '';
  }, [surahs, activeSura]);

  // Verse segments for active Sura (e.g. ["1-7"] or ["1-7", "8-20", ...])
  const segments = useMemo(() => {
    const ver = suraVerseRanges[activeSura];
    if (!ver) return ["1-7"];
    const segs = [];
    for (let i = 0; i < ver.length - 1; i++) {
      segs.push(`${ver[i]}-${ver[i + 1] - 1}`);
    }
    return segs;
  }, [activeSura]);

  const activeSegmentStr = useMemo(() => {
    return segments[activeSegmentIdx] || segments[0] || "1-7";
  }, [segments, activeSegmentIdx]);

  // Segment verse boundaries
  const segmentBoundaries = useMemo(() => {
    const [start, end] = activeSegmentStr.split('-').map(Number);
    return { start: start || 1, end: end || 7 };
  }, [activeSegmentStr]);

  // Save settings in localStorage
  useEffect(() => {
    localStorage.setItem('quran_arabic_size', arabicSize.toString());
    localStorage.setItem('quran_tamil_size', tamilSize.toString());
    localStorage.setItem('quran_show_arabic', showArabicText.toString());
    localStorage.setItem('quran_show_tamil', showTamilText.toString());
  }, [arabicSize, tamilSize, showArabicText, showTamilText]);

  // Fetch Arabic and Tamil Quran translations
  useEffect(() => {
    async function loadContent() {
      setLoading(true);
      stopAudio();
      try {
        const arabicRes = await apiFetch('/api/quran/arabic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sura: activeSura, verse: activeSegmentStr })
        });
        if (!arabicRes.ok) throw new Error("Failed to load Arabic Quran text");
        const arHtml = await arabicRes.text();
        setArabicHTML(arHtml);

        const tamilRes = await apiFetch('/api/quran/tamil', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sura: activeSura, verse: activeSegmentStr })
        });
        if (!tamilRes.ok) throw new Error("Failed to load Tamil Quran text");
        const tmHtml = await tamilRes.text();
        setTamilHTML(tmHtml);
      } catch (error) {
        console.error("Error fetching Quran text:", error);
        toast.error("Failed to load Quranic text. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, [activeSura, activeSegmentStr]);

  // Fetch introduction HTML when drawer opens or active surah changes
  useEffect(() => {
    if (!showIntro) return;
    async function loadIntro() {
      setIntroLoading(true);
      try {
        const res = await apiFetch(`/api/quran/intro/${activeSura}`);
        if (!res.ok) throw new Error("Introduction not found");
        const html = await res.text();
        setIntroHTML(html);
      } catch (error) {
        console.error("Error fetching intro:", error);
        setIntroHTML("<p class='p-6 text-center text-muted-foreground'>முன்னுரை விவரங்கள் கிடைக்கவில்லை.</p>");
      } finally {
        setIntroLoading(false);
      }
    }
    loadIntro();
  }, [activeSura, showIntro]);

  // Parse HTML spans to structured arrays
  const parsedArabicSpans = useMemo(() => {
    if (!arabicHTML) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(arabicHTML, 'text/html');
    return Array.from(doc.querySelectorAll('span')).map(s => s.innerHTML.trim());
  }, [arabicHTML]);

  const parsedTamilSpans = useMemo(() => {
    if (!tamilHTML) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(tamilHTML, 'text/html');
    return Array.from(doc.querySelectorAll('span')).map(s => s.innerHTML.trim());
  }, [tamilHTML]);

  // Synchronized verse list pairing Arabic with Tamil
  const versesList = useMemo(() => {
    const list = [];
    const maxLen = Math.max(parsedArabicSpans.length, parsedTamilSpans.length);
    
    for (let i = 0; i < maxLen; i++) {
      const tmText = parsedTamilSpans[i] || "";
      const arText = parsedArabicSpans[i] || "";
      
      // Parse verse number from Tamil text, e.g. "1:3 அவன் மாபெருங்..." -> verse 3
      const match = tmText.match(/^(\d+):(\d+)/);
      const verseNum = match ? parseInt(match[2]) : (segmentBoundaries.start + i);
      
      list.push({
        arabic: arText,
        tamil: tmText,
        verseNum: verseNum
      });
    }
    return list;
  }, [parsedArabicSpans, parsedTamilSpans, segmentBoundaries]);

  // Audio reciter URL formatter
  const getAudioUrl = (suraId, verseNum) => {
    const formattedSura = suraId.toString().padStart(3, '0');
    const formattedVerse = verseNum.toString().padStart(3, '0');
    return `https://islamicstudies.info/quran/afasy/audio/${formattedSura}${formattedVerse}.mp3`;
  };

  // Play a specific verse
  const playVerse = (verseNum) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    // Stop current audio if any
    audioRef.current.pause();
    
    const audioUrl = getAudioUrl(activeSura, verseNum);
    audioRef.current.src = audioUrl;
    audioRef.current.volume = isMuted ? 0 : audioVolume;
    
    setCurrentPlayingVerse(verseNum);
    setIsPlaying(true);
    
    audioRef.current.play().catch(e => {
      console.warn("Audio playback issue:", e);
      toast.error("Audio stream temporary unavailable.");
      setIsPlaying(false);
    });

    // Auto-advance logic
    audioRef.current.onended = () => {
      const nextVerse = verseNum + 1;
      if (nextVerse <= segmentBoundaries.end) {
        // Play next verse
        playVerse(nextVerse);
      } else {
        // End of segment reached
        if (repeatMode === 'repeat-segment') {
          playVerse(segmentBoundaries.start);
        } else {
          stopAudio();
          toast.success("Completed segment recitation!");
        }
      }
    };
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      const startVerse = currentPlayingVerse || segmentBoundaries.start;
      playVerse(startVerse);
    }
  };

  // Stop audio entirely
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
    }
    setIsPlaying(false);
    setCurrentPlayingVerse(null);
  };

  // Handle manual volume slide
  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setAudioVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : vol;
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.volume = nextMuted ? 0 : audioVolume;
    }
  };

  // Skip forward / backward
  const skipVerse = (direction) => {
    const current = currentPlayingVerse || segmentBoundaries.start;
    let target = direction === 'next' ? current + 1 : current - 1;
    
    if (target > segmentBoundaries.end) {
      target = segmentBoundaries.start;
    } else if (target < segmentBoundaries.start) {
      target = segmentBoundaries.end;
    }
    
    playVerse(target);
  };

  // Navigate Chapters (Sura)
  const navigateSura = (direction) => {
    let nextSura = direction === 'next' ? activeSura + 1 : activeSura - 1;
    if (nextSura > 114) nextSura = 1;
    if (nextSura < 1) nextSura = 114;
    setActiveSura(nextSura);
    setActiveSegmentIdx(0);
  };

  // Navigate Segments
  const navigateSegment = (direction) => {
    let nextIdx = direction === 'next' ? activeSegmentIdx + 1 : activeSegmentIdx - 1;
    if (nextIdx >= segments.length) {
      // Go to next sura
      let nextSura = activeSura + 1;
      if (nextSura > 114) nextSura = 1;
      setActiveSura(nextSura);
      setActiveSegmentIdx(0);
    } else if (nextIdx < 0) {
      // Go to previous sura last segment
      let prevSura = activeSura - 1;
      if (prevSura < 1) prevSura = 114;
      setActiveSura(prevSura);
      const prevSuraSegmentsCount = suraVerseRanges[prevSura].length - 1;
      setActiveSegmentIdx(prevSuraSegmentsCount - 1);
    } else {
      setActiveSegmentIdx(nextIdx);
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
      }
    };
  }, []);

  return (
    <div className="quran-container">
      {/* Upper decorative banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-700 py-10 px-4 text-center text-white shadow-md relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto max-w-4xl space-y-2 relative z-10"
        >
          <Badge className="bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold border-none px-4 py-1 rounded-full text-xs uppercase tracking-wider mb-2">
            Interactive Digital Quran
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-serif">தமிழ் திருக்குர்ஆன் மொழிபெயர்ப்பு</h1>
          <p className="text-sm md:text-base text-emerald-100/90 max-w-xl mx-auto font-medium">
            இஸ்லாமிய அறக்கட்டளை (IFT) வழங்கிய உண்மையான தமிழ் விளக்கவுரை மற்றும் ஆடியோவுடன் கூடிய மின்-குர்ஆன்
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 mt-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT SIDEBAR: Surah Directory */}
          <div className="lg:col-span-1 space-y-6">
            <div className="quran-header-panel p-5 flex flex-col h-[650px]">
              <div className="flex items-center justify-between pb-4 border-b border-muted">
                <span className="font-extrabold text-sm text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-amber-500" /> அத்தியாயங்கள் (Surahs)
                </span>
                <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">114 Surahs</span>
              </div>
              
              {/* Search Box */}
              <div className="relative my-4">
                <input 
                  type="text" 
                  placeholder="தேடு / Search Sura..." 
                  value={surahSearch}
                  onChange={(e) => setSurahSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-emerald-700 outline-none transition-all"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                {surahSearch && (
                  <button onClick={() => setSurahSearch('')} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Surah List scrollable */}
              <div className="flex-1 overflow-y-auto quran-scrollable pr-1 space-y-1">
                {filteredSurahs.map((sura) => (
                  <button
                    key={sura.id}
                    onClick={() => {
                      setActiveSura(sura.id);
                      setActiveSegmentIdx(0);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                      activeSura === sura.id 
                        ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/10' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="truncate pr-2">{sura.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded shrink-0 ${
                      activeSura === sura.id ? 'bg-emerald-900 text-emerald-300' : 'bg-muted text-muted-foreground font-medium'
                    }`}>
                      {sura.id}
                    </span>
                  </button>
                ))}
                {filteredSurahs.length === 0 && (
                  <div className="text-center py-12 text-xs text-muted-foreground">அத்தியாயங்கள் எதுவும் காணப்படவில்லை</div>
                )}
              </div>
            </div>
          </div>

          {/* MAIN COLUMN: Quran Content Viewer */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Top Toolbar controls */}
            <div className="quran-header-panel p-5 flex flex-wrap items-center justify-between gap-4">
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => navigateSura('prev')}
                  className="rounded-xl border-muted hover:bg-slate-50 dark:hover:bg-slate-900"
                  title="Previous Chapter"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-left">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">தற்போதைய அத்தியாயம்</span>
                  <h3 className="text-base font-extrabold text-emerald-800 dark:text-emerald-400 font-serif leading-tight">
                    {currentSurahName}
                  </h3>
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => navigateSura('next')}
                  className="rounded-xl border-muted hover:bg-slate-50 dark:hover:bg-slate-900"
                  title="Next Chapter"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Segment selection */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">வசனங்கள் (Verses)</span>
                  <select
                    value={activeSegmentIdx}
                    onChange={(e) => setActiveSegmentIdx(parseInt(e.target.value))}
                    className="quran-select bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-1 focus:ring-emerald-700 outline-none text-foreground"
                  >
                    {segments.map((seg, idx) => (
                      <option key={idx} value={idx}>வசனம்: {seg}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-1 mt-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => navigateSegment('prev')}
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                    title="Previous Segment"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => navigateSegment('next')}
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                    title="Next Segment"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Feature Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowIntro(true)}
                  className="rounded-xl border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" /> முன்னுரை (Context)
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowSettings(!showSettings)}
                  className={`rounded-xl border-muted text-xs font-bold ${showSettings ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  <Settings className="w-3.5 h-3.5 mr-1.5" /> வடிவமைப்பு
                </Button>
              </div>
            </div>

            {/* Config Panel Dropdown with SlideDown animation */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="quran-header-panel p-5 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="space-y-4">
                    <span className="font-extrabold text-xs text-muted-foreground flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-800" /> எழுத்து அளவு (Font Sizes)
                    </span>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>அரபி எழுத்து (Arabic Font Size)</span>
                          <span className="text-emerald-800">{arabicSize}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="20" 
                          max="48" 
                          value={arabicSize} 
                          onChange={(e) => setArabicSize(parseInt(e.target.value))}
                          className="w-full accent-emerald-700 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>தமிழ் மொழிபெயர்ப்பு (Tamil Font Size)</span>
                          <span className="text-emerald-800">{tamilSize}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="12" 
                          max="28" 
                          value={tamilSize} 
                          onChange={(e) => setTamilSize(parseInt(e.target.value))}
                          className="w-full accent-emerald-700 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <span className="font-extrabold text-xs text-muted-foreground flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-emerald-800" /> மொழிகள் நிலை (Visibility Toggles)
                    </span>
                    <div className="flex flex-wrap gap-4 pt-1">
                      <button 
                        onClick={() => setShowArabicText(!showArabicText)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          showArabicText 
                            ? 'bg-emerald-800/10 border-emerald-800/20 text-emerald-800 dark:text-emerald-400' 
                            : 'border-muted text-muted-foreground hover:bg-slate-50'
                        }`}
                      >
                        {showArabicText ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />} அரபு உரை (Arabic)
                      </button>

                      <button 
                        onClick={() => setShowTamilText(!showTamilText)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          showTamilText 
                            ? 'bg-emerald-800/10 border-emerald-800/20 text-emerald-800 dark:text-emerald-400' 
                            : 'border-muted text-muted-foreground hover:bg-slate-50'
                        }`}
                      >
                        {showTamilText ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />} தமிழ் மொழிபெயர்ப்பு (Tamil)
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* THE NOBLE QURAN CONTENT BOARD */}
            <table className="quran-table w-full border-collapse">
              <tbody>
                <tr>
                  <td className="quran-corner" style={{ backgroundImage: 'url(/assets/quran/1.png)' }}></td>
                  <td className="quran-horizontal" style={{ backgroundImage: 'url(/assets/quran/2.png)' }}></td>
                  <td className="quran-corner" style={{ backgroundImage: 'url(/assets/quran/3.png)' }}></td>
                </tr>
                <tr>
                  <td className="quran-vertical" style={{ backgroundImage: 'url(/assets/quran/4.png)' }}></td>
                  <td className="quran-paper-frame p-6 md:p-8 min-h-[400px] flex flex-col justify-between" style={{ verticalAlign: 'top' }}>
                    
                    <div className="text-center mb-6">
                      <img src="/assets/quran/Quran-Text.png" className="h-9 mx-auto dark:brightness-200" alt="Noble Quran Banner" />
                    </div>

                    {loading ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-4">
                        <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                        <p className="text-xs font-bold text-muted-foreground">தகவல்கள் சேகரிக்கப்படுகின்றன. காத்திருக்கவும்...</p>
                      </div>
                    ) : (
                      <div className="space-y-12">
                        
                        {/* Bismillah Header for all surahs except Sura 9 (At-Tawbah), but Sura 1 (Al-Fatihah) has it as the first verse */}
                        {activeSura !== 1 && activeSura !== 9 && activeSegmentIdx === 0 && (
                          <div className="text-center py-6 border-b border-slate-200/50 dark:border-slate-800/30">
                            <p className="font-serif text-3xl text-emerald-800/90 dark:text-emerald-300 font-bold" style={{ direction: 'rtl' }}>
                              بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْـمِ
                            </p>
                            <p className="text-[11px] font-bold text-muted-foreground mt-2">
                              அளவற்ற அருளாளனும், நிகரற்ற அன்புடையோனுமாகிய அல்லாஹ்வின் திருப்பெயரால் (துவங்குகிறேன்)
                            </p>
                          </div>
                        )}

                        <div className="space-y-6">
                          {versesList.map((verse, index) => {
                            const isHighlighted = currentPlayingVerse === verse.verseNum;
                            
                            return (
                              <div 
                                key={index}
                                onClick={() => playVerse(verse.verseNum)}
                                className={`p-4 md:p-6 rounded-2xl border border-transparent transition-all duration-300 grid grid-cols-1 gap-6 cursor-pointer relative hover:shadow-lg hover:shadow-black/5 hover:border-slate-200/40 dark:hover:border-slate-800/20 ${
                                  isHighlighted 
                                    ? 'bg-emerald-500/5 border-emerald-500/20 shadow-md shadow-emerald-500/5' 
                                    : ''
                                }`}
                              >
                                {/* ARABIC TEXT VIEW */}
                                {showArabicText && (
                                  <div 
                                    className={`arabic-text transition-all duration-300 ${isHighlighted ? 'green-active px-4 py-2 rounded-2xl' : ''}`}
                                    style={{ fontSize: `${arabicSize}px` }}
                                    dangerouslySetInnerHTML={{ __html: verse.arabic }}
                                  />
                                )}

                                {/* TAMIL TEXT VIEW */}
                                {showTamilText && (
                                  <div 
                                    className={`tamil-text transition-all duration-300 border-l-2 pl-4 ${
                                      isHighlighted 
                                        ? 'border-emerald-500 text-emerald-950 dark:text-emerald-300' 
                                        : 'border-slate-200 dark:border-slate-800'
                                    }`}
                                    style={{ fontSize: `${tamilSize}px` }}
                                  >
                                    <span className="font-extrabold text-amber-600 dark:text-amber-500 mr-2 text-xs select-none">
                                      {activeSura}:{verse.verseNum}
                                    </span>
                                    <span dangerouslySetInnerHTML={{ __html: verse.tamil.replace(/^\d+:\d+/, '').trim() }} />
                                  </div>
                                )}

                                {/* Hover Play Indicator */}
                                <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Badge className="bg-emerald-800 text-white font-medium text-[10px] px-2 py-0.5">Click to recite</Badge>
                                </div>
                              </div>
                            );
                          })}

                          {versesList.length === 0 && (
                            <div className="text-center py-20 text-muted-foreground text-sm font-bold">
                              இந்த பிரிவில் வசனங்கள் இல்லை.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Bottom footer pagination inside paper frame */}
                    <div className="border-t border-slate-200/50 dark:border-slate-800/30 pt-6 mt-8 flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigateSegment('prev')}
                        className="rounded-xl border-muted hover:bg-slate-50 text-xs font-bold"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" /> முந்தைய வசனங்கள் (Prev)
                      </Button>
                      <div className="text-xs font-extrabold text-amber-600 uppercase tracking-widest font-mono">
                        Sura {activeSura} • Verses {activeSegmentStr}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigateSegment('next')}
                        className="rounded-xl border-muted hover:bg-slate-50 text-xs font-bold"
                      >
                        அடுத்த வசனங்கள் (Next) <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>

                  </td>
                  <td className="quran-vertical" style={{ backgroundImage: 'url(/assets/quran/5.png)' }}></td>
                </tr>
                <tr>
                  <td className="quran-corner" style={{ backgroundImage: 'url(/assets/quran/6.png)' }}></td>
                  <td className="quran-horizontal" style={{ backgroundImage: 'url(/assets/quran/7.png)' }}></td>
                  <td className="quran-corner" style={{ backgroundImage: 'url(/assets/quran/8.png)' }}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FIXED AUDIO CONTROLLER FOOTER BAR */}
      <div className={`quran-audio-player-bar visible`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Track Detail */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-800/10 dark:bg-emerald-800/20 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
              <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-bounce' : ''}`} />
            </div>
            <div className="text-left truncate">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">ஓதுபவர் (Reciter): Mishary Alafasy</span>
              <span className="text-xs font-extrabold text-foreground truncate block">
                {currentSurahName} 
                {currentPlayingVerse ? ` — வசனம்: ${currentPlayingVerse}` : ` — தயார் நிலையில்`}
              </span>
            </div>
          </div>

          {/* Primary Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skipVerse('prev')}
              disabled={!currentPlayingVerse}
              className="h-9 w-9 rounded-full text-slate-500 hover:text-slate-800"
              title="Previous Verse"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <Button
              onClick={togglePlayPause}
              size="icon"
              className="h-12 w-12 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-800/20"
              title={isPlaying ? "Pause Recitation" : "Play Recitation"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 pl-0.5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => skipVerse('next')}
              disabled={!currentPlayingVerse}
              className="h-9 w-9 rounded-full text-slate-500 hover:text-slate-800"
              title="Next Verse"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            {currentPlayingVerse && (
              <Button
                variant="ghost"
                size="icon"
                onClick={stopAudio}
                className="h-9 w-9 rounded-full text-red-500 hover:bg-red-50"
                title="Stop Audio"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Volume and Preferences */}
          <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-none pt-3 md:pt-0">
            {/* AutoPlay Preference */}
            <select
              value={repeatMode}
              onChange={(e) => setRepeatMode(e.target.value)}
              className="bg-transparent border border-muted rounded-xl px-2.5 py-1 text-[10px] font-bold text-muted-foreground focus:outline-none"
            >
              <option value="repeat-segment">தொடர் ஓதுதல் (Loop Segment)</option>
              <option value="stop-at-end">வசனம் முடிந்ததும் நிறுத்து</option>
            </select>

            {/* Volume controller */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMute}
                className="h-8 w-8 rounded-full text-muted-foreground"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={isMuted ? 0 : audioVolume} 
                onChange={handleVolumeChange}
                className="w-20 accent-emerald-800 cursor-pointer h-1 rounded-lg"
              />
            </div>
          </div>

        </div>
      </div>

      {/* OVERLAY DRAWER FOR SURAH INTRODUCTIONS */}
      <div 
        className={`quran-drawer-overlay ${showIntro ? 'active' : ''}`}
        onClick={() => setShowIntro(false)}
      />
      <div className={`quran-drawer-panel ${showIntro ? 'active' : ''}`}>
        <div className="flex items-center justify-between p-6 border-b border-muted bg-slate-50 dark:bg-slate-900/50">
          <div className="text-left">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">அத்தியாய முன்னுரை (Introduction)</span>
            <h3 className="text-base font-extrabold text-emerald-800 dark:text-emerald-400 font-serif leading-tight">
              {currentSurahName}
            </h3>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowIntro(false)}
            className="rounded-full hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto quran-scrollable p-6 md:p-8 space-y-6">
          {introLoading ? (
            <div className="h-full flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-10 h-10 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
              <p className="text-xs font-bold text-muted-foreground">முன்னுரை பதிவிறக்கம் செய்யப்படுகிறது...</p>
            </div>
          ) : (
            <div 
              className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-sm pr-2 space-y-4"
              dangerouslySetInnerHTML={{ __html: introHTML }}
            />
          )}
        </div>

        <div className="p-6 border-t border-muted bg-slate-50 dark:bg-slate-900/50 text-center">
          <Button 
            onClick={() => setShowIntro(false)}
            className="w-full bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold"
          >
            மூடு (Close Drawer)
          </Button>
        </div>
      </div>

    </div>
  );
}
