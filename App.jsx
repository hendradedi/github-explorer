import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Star, 
  GitFork, 
  BookOpen, 
  Code, 
  ExternalLink, 
  AlertTriangle, 
  Settings, 
  Github, 
  FileCode, 
  User,
  ShieldAlert
} from 'lucide-react';

export default function App() {
  // State untuk form pencarian
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('repositories'); // 'repositories' atau 'code'
  const [language, setLanguage] = useState('');
  const [minStars, setMinStars] = useState('');
  
  // State untuk hasil dan status
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  // State untuk pengaturan (API Token)
  const [showSettings, setShowSettings] = useState(false);
  const [apiToken, setApiToken] = useState(() => localStorage.getItem('github_pat') || '');

  // Simpan token ke local storage saat berubah
  useEffect(() => {
    localStorage.setItem('github_pat', apiToken);
  }, [apiToken]);

  // Fungsi utama pencarian
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() && !language) {
      setError('Masukkan kata kunci pencarian atau qualifier.');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setTotalCount(0);

    try {
      // Membangun string query
      let q = query.trim();
      
      if (language) {
        q += ` language:${language}`;
      }
      
      if (minStars && searchType === 'repositories') {
        q += ` stars:>=${minStars}`;
      }

      // Menyiapkan header
      const headers = {
        'Accept': 'application/vnd.github.v3+json'
      };

      if (apiToken) {
        headers['Authorization'] = `token ${apiToken}`;
      }

      // Memanggil API GitHub
      const response = await fetch(
        `https://api.github.com/search/${searchType}?q=${encodeURIComponent(q)}&per_page=30`,
        { headers }
      );

      const data = await response.json();

      if (!response.ok) {
        // Menangani error rate limit (403) atau error lainnya
        if (response.status === 403 && data.message.includes('API rate limit')) {
          throw new Error('Batas akses API tercapai. Silakan tambahkan Personal Access Token di Pengaturan untuk batas yang lebih tinggi.');
        }
        throw new Error(data.message || 'Terjadi kesalahan saat mengambil data dari GitHub.');
      }

      setResults(data.items || []);
      setTotalCount(data.total_count || 0);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Komponen Kartu untuk Repositori
  const RepositoryCard = ({ repo }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <a 
          href={repo.html_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-lg font-semibold text-blue-600 hover:underline flex items-center gap-2"
        >
          <BookOpen size={18} className="text-gray-500" />
          {repo.full_name}
        </a>
        <span className="flex items-center gap-1 text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
          <Star size={14} className="text-yellow-500" /> {repo.stargazers_count.toLocaleString()}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {repo.description || 'Tidak ada deskripsi yang tersedia.'}
      </p>
      
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
        {repo.language && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <GitFork size={14} /> {repo.forks_count.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <AlertTriangle size={14} /> {repo.open_issues_count} issues
        </span>
        <span>Diperbarui pada {new Date(repo.updated_at).toLocaleDateString('id-ID')}</span>
      </div>

      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {repo.topics.slice(0, 5).map(topic => (
            <span key={topic} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-md">
              {topic}
            </span>
          ))}
          {repo.topics.length > 5 && (
            <span className="bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded-md">
              +{repo.topics.length - 5}
            </span>
          )}
        </div>
      )}
    </div>
  );

  // Komponen Kartu untuk Kode
  const CodeCard = ({ item }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-2">
        <a 
          href={item.html_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-base font-semibold text-blue-600 hover:underline flex items-center gap-2 break-all"
        >
          <FileCode size={18} className="text-gray-500 flex-shrink-0" />
          {item.name}
        </a>
      </div>
      
      <div className="text-sm text-gray-500 mb-3 flex items-center gap-2">
        <BookOpen size={14} />
        <a href={item.repository.html_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">
          {item.repository.full_name}
        </a>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono text-gray-700 overflow-x-auto border border-gray-100">
        <p className="whitespace-pre-wrap break-all">Path: {item.path}</p>
      </div>
      
      <div className="mt-3 flex justify-end">
        <a 
          href={item.html_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          Lihat File di GitHub <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Github size={28} />
            <h1 className="text-xl font-bold tracking-tight">GitHub Explorer</h1>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors flex items-center gap-2 text-sm"
            title="Pengaturan"
          >
            <Settings size={20} />
            <span className="hidden sm:inline">Pengaturan API</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Panel Pengaturan */}
        {showSettings && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-200 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <ShieldAlert size={20} className="text-orange-500"/> 
              Pengaturan Akses API
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              API Pencarian GitHub memiliki batas 10 request per menit untuk pengguna anonim. Masukkan Personal Access Token Anda untuk meningkatkan batas ini. Token hanya disimpan di browser Anda (Local Storage).
            </p>
            <div className="flex gap-2 max-w-lg">
              <input 
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxx"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
              />
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Simpan & Tutup
              </button>
            </div>
          </div>
        )}

        {/* Area Form Pencarian */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Tipe Pencarian */}
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="searchType" 
                  value="repositories"
                  checked={searchType === 'repositories'}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="font-medium text-gray-700">Repositori</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="searchType" 
                  value="code"
                  checked={searchType === 'code'}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="font-medium text-gray-700">Kode</span>
              </label>
            </div>

            {/* Input Utama */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={`Cari ${searchType === 'repositories' ? 'repositori' : 'kode'}... (Ketik qualifier seperti topic:react, user:facebook)`}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-lg transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Filter Tambahan */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bahasa Pemrograman</label>
                <select 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="">Semua Bahasa</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="typescript">TypeScript</option>
                  <option value="c#">C#</option>
                  <option value="php">PHP</option>
                  <option value="c++">C++</option>
                  <option value="go">Go</option>
                  <option value="ruby">Ruby</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                </select>
              </div>

              {searchType === 'repositories' && (
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimal Bintang (Stars)</label>
                  <input 
                    type="number" 
                    placeholder="Contoh: 1000"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={minStars}
                    onChange={(e) => setMinStars(e.target.value)}
                  />
                </div>
              )}
              
              <div className="flex items-end mt-2 md:mt-0">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="h-[46px] px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full md:w-auto"
                >
                  {loading ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  ) : (
                    <>Cari <Search size={18} /></>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Hasil Pencarian */}
        <div className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Info Hasil */}
          {!loading && !error && results.length > 0 && (
            <div className="flex justify-between items-end border-b border-gray-200 pb-2">
              <h2 className="text-xl font-semibold text-gray-800">
                Ditemukan {totalCount.toLocaleString()} hasil
              </h2>
              <span className="text-sm text-gray-500">Menampilkan hingga 30 hasil teratas</span>
            </div>
          )}

          {/* Daftar Kartu */}
          {!loading && results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((item) => (
                searchType === 'repositories' 
                  ? <RepositoryCard key={item.id} repo={item} />
                  : <CodeCard key={item.sha} item={item} />
              ))}
            </div>
          )}

          {/* State Kosong */}
          {!loading && !error && results.length === 0 && query && (
             <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
               <Search size={48} className="mx-auto text-gray-300 mb-4" />
               <h3 className="text-lg font-medium text-gray-900">Tidak ada hasil ditemukan</h3>
               <p className="text-gray-500 mt-1">Coba gunakan kata kunci lain atau kurangi filter Anda.</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}