import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Code2, 
  Layers, 
  Cloud, 
  Cpu, 
  Box, 
  Play, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft,
  Terminal,
  BookOpen,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { DEFAULT_SCENARIOS, CATEGORIES, Scenario, getFeedback, Feedback } from './services/geminiService';
import { Card } from './components/Card';
import Markdown from 'react-markdown';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [code, setCode] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const filteredScenarios = selectedCategory 
    ? DEFAULT_SCENARIOS.filter(s => s.category === selectedCategory)
    : DEFAULT_SCENARIOS;

  const handleStartScenario = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setCode(scenario.initialCode);
    setFeedback(null);
    setIsMenuOpen(false);
  };

  const handleEvaluate = async () => {
    if (!activeScenario) return;
    setIsEvaluating(true);
    try {
      const result = await getFeedback(activeScenario, code);
      setFeedback(result);
    } catch (error) {
      console.error("Evaluation failed", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-emerald-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-zinc-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2" onClick={() => { setActiveScenario(null); setSelectedCategory(null); }}>
          <div className="bg-emerald-600 p-1.5 rounded-lg">
            <Database className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">DataMaster</span>
        </div>
        
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-20 px-6"
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Learning Paths</h2>
            <div className="grid gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setIsMenuOpen(false); setActiveScenario(null); }}
                  className={`text-left p-4 rounded-xl font-medium transition-colors ${selectedCategory === cat ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-zinc-50'}`}
                >
                  {cat}
                </button>
              ))}
              <button
                onClick={() => { setSelectedCategory(null); setIsMenuOpen(false); setActiveScenario(null); }}
                className="text-left p-4 rounded-xl font-medium text-zinc-500"
              >
                View All Scenarios
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-xl mx-auto p-4 pb-24">
        {!activeScenario ? (
          <div className="space-y-6">
            <header className="py-4">
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {selectedCategory || "Practice Lab"}
              </h1>
              <p className="text-zinc-500">
                Master data engineering and ML concepts through interactive scenarios.
              </p>
            </header>

            <div className="grid gap-4">
              {filteredScenarios.map(scenario => (
                <Card
                  key={scenario.id}
                  title={scenario.title}
                  description={scenario.description}
                  icon={scenario.language === 'sql' ? Database : Code2}
                  onClick={() => handleStartScenario(scenario)}
                >
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500 px-2 py-1 rounded">
                      {scenario.category}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                      {scenario.language}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setActiveScenario(null)}
              className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Lab
            </button>

            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold">{activeScenario.title}</h2>
              </div>
              
              <div className="prose prose-sm text-zinc-600 mb-6">
                <p className="font-medium text-zinc-900 mb-2">Challenge:</p>
                <p>{activeScenario.challenge}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                    <Terminal className="w-3 h-3" /> {activeScenario.language} Editor
                  </span>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-48 bg-zinc-900 text-emerald-400 font-mono text-sm p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none shadow-inner"
                  placeholder="Write your code here..."
                  spellCheck={false}
                />
              </div>

              <button
                onClick={handleEvaluate}
                disabled={isEvaluating || !code.trim()}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
              >
                {isEvaluating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    Run Simulation
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl p-6 border ${feedback.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    {feedback.isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-600" />
                    )}
                    <h3 className={`font-bold text-lg ${feedback.isCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>
                      {feedback.isCorrect ? "Success!" : "Needs Improvement"}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm text-zinc-700 leading-relaxed">
                      <p className="font-bold mb-1">Feedback:</p>
                      <p>{feedback.explanation}</p>
                    </div>

                    <div className="bg-black/5 rounded-xl p-4">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Simulated Output</p>
                      <pre className="text-xs font-mono text-zinc-800 overflow-x-auto">
                        {feedback.simulatedOutput}
                      </pre>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Pro Tips</p>
                      <div className="grid gap-2">
                        {feedback.suggestions.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Bottom Quick Actions */}
      {!activeScenario && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-md border border-zinc-200 p-2 rounded-2xl shadow-xl z-30">
          <button 
            onClick={() => setSelectedCategory(null)}
            className="p-3 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-600"
            title="All Scenarios"
          >
            <BookOpen className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-zinc-200" />
          <button 
            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-200"
            onClick={() => {
              const random = DEFAULT_SCENARIOS[Math.floor(Math.random() * DEFAULT_SCENARIOS.length)];
              handleStartScenario(random);
            }}
          >
            <Zap className="w-4 h-4" /> Quick Practice
          </button>
        </div>
      )}
    </div>
  );
}
