"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, Star, GitFork, Users, MapPin, Calendar, ExternalLink, Github, Globe, 
  Book, Moon, Sun, Download, Share, Filter, 
  Eye, Clock, Copy, Award, Zap, Activity, GitBranch, Package, Shield,
  BarChart3, PieChart, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { TRENDING_DEVELOPERS, TRENDING_ORGANIZATIONS } from "@/lib/trending";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import { RepoAnalytics } from "@/components/RepoAnalytics";
import { DeveloperAchievements } from "@/components/DeveloperAchievements";
import { AIInsights } from "@/components/AIInsights";
import { DeveloperBattle } from "@/components/DeveloperBattle";

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  bio: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
  location: string;
  blog: string;
  email: string;
  company: string;
  twitter_username: string;
  type: string;
  hireable: boolean;
  public_gists: number;
}

interface Repo {
  id: number;
  name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  created_at: string;
  topics: string[];
  fork: boolean;
  archived: boolean;
  private: boolean;
  size: number;
  open_issues_count: number;
  watchers_count: number;
  default_branch: string;
  license: { name: string } | null;
  pushed_at: string;
}

interface LanguageStats {
  [key: string]: number;
}


export default function Home() {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repo[]>([]);
  const [languageStats, setLanguageStats] = useState<LanguageStats>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"repos" | "stats" | "analytics" | "activity">("repos");
  const [darkMode, setDarkMode] = useState(false);
  const [repoFilter, setRepoFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "stars" | "forks" | "name">("updated");
  const [compareUsers, setCompareUsers] = useState<GitHubUser[]>([]);
  const [compareUserRepos, setCompareUserRepos] = useState<{ [key: string]: Repo[] }>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("github-search-history");
    const savedDarkMode = localStorage.getItem("github-hunter-dark-mode");
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("github-hunter-dark-mode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    let filtered = repos;
    
    if (repoFilter) {
      filtered = filtered.filter(repo =>
        repo.name.toLowerCase().includes(repoFilter.toLowerCase()) ||
        repo.description?.toLowerCase().includes(repoFilter.toLowerCase())
      );
    }
    
    if (languageFilter) {
      filtered = filtered.filter(repo => repo.language === languageFilter);
    }
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "stars":
          return b.stargazers_count - a.stargazers_count;
        case "forks":
          return b.forks_count - a.forks_count;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });
    
    setFilteredRepos(filtered);
  }, [repos, repoFilter, languageFilter, sortBy]);

  const saveToHistory = (username: string) => {
    const updated = [username, ...searchHistory.filter(u => u !== username)].slice(0, 8);
    setSearchHistory(updated);
    localStorage.setItem("github-search-history", JSON.stringify(updated));
  };

  const calculateLanguageStats = (repos: Repo[]) => {
    const stats: LanguageStats = {};
    repos.forEach(repo => {
      if (repo.language && !repo.fork) {
        stats[repo.language] = (stats[repo.language] || 0) + 1;
      }
    });
    return stats;
  };

  const handleSearch = async () => {
    if (!username.trim()) return;
    setLoading(true);
    setError("");
    setUser(null);
    setRepos([]);
    setLanguageStats({});
    
    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`)
      ]);
      
      if (!userRes.ok) throw new Error("User not found");
      
      const userData: GitHubUser = await userRes.json();
      const reposData: Repo[] = await reposRes.json();
      
      setUser(userData);
      setRepos(reposData);
      setLanguageStats(calculateLanguageStats(reposData));
      saveToHistory(username);
      toast.success(`Found ${userData.name || userData.login} with ${reposData.length} repositories!`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        setError("An unexpected error occurred");
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getTopLanguages = () => {
    return Object.entries(languageStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);
  };

  const getTotalStars = () => {
    return repos.reduce((total, repo) => total + repo.stargazers_count, 0);
  };

  const getTotalForks = () => {
    return repos.reduce((total, repo) => total + repo.forks_count, 0);
  };

  const getUniqueLanguages = () => {
    return [...new Set(repos.map(repo => repo.language).filter(Boolean))].sort();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const exportUserData = () => {
    if (!user) return;
    
    const data = {
      user,
      repos,
      stats: {
        totalStars: getTotalStars(),
        totalForks: getTotalForks(),
        languages: languageStats,
        exportedAt: new Date().toISOString()
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user.login}-github-data.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully!");
  };

  const shareProfile = () => {
    if (!user) return;
    const url = `${window.location.origin}?user=${user.login}`;
    copyToClipboard(url);
  };

  const addToComparison = async () => {
    if (!user) return;
    if (compareUsers.some(u => u.login === user.login)) {
      toast.error("User already in comparison list");
      return;
    }
    if (compareUsers.length >= 3) {
      toast.error("Maximum 3 users for comparison");
      return;
    }
    setCompareUsers([...compareUsers, user]);
    setCompareUserRepos({...compareUserRepos, [user.login]: repos});
    toast.success(`Added ${user.login} to comparison`);
  };

  const getActivityScore = () => {
    if (!repos.length) return 0;
    const recentRepos = repos.filter(repo => {
      const lastUpdate = new Date(repo.updated_at);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return lastUpdate > sixMonthsAgo;
    });
    return Math.min(100, (recentRepos.length / repos.length) * 100);
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      JavaScript: "bg-yellow-500",
      TypeScript: "bg-blue-500",
      Python: "bg-green-500",
      Java: "bg-red-500",
      "C++": "bg-purple-500",
      C: "bg-gray-500",
      "C#": "bg-indigo-500",
      PHP: "bg-purple-400",
      Ruby: "bg-red-400",
      Go: "bg-cyan-500",
      Rust: "bg-orange-500",
      Swift: "bg-orange-400",
      Kotlin: "bg-purple-600",
      Dart: "bg-blue-400",
      HTML: "bg-orange-600",
      CSS: "bg-blue-600",
      Shell: "bg-green-600"
    };
    return colors[language] || "bg-gray-400";
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black" 
        : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
    }`}>
      {/* Enhanced Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Github className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  GitHunter Pro
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Advanced GitHub Analytics</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {compareUsers.length > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                      <Users className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Compare </span>({compareUsers.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Epic Developer Showdown</DialogTitle>
                      <DialogDescription>
                        Compare GitHub profiles with advanced battle analytics
                      </DialogDescription>
                    </DialogHeader>
                    
                    {/* Developer Battle Component */}
                    <DeveloperBattle 
                      users={compareUsers}
                      userRepos={compareUserRepos}
                      onRemoveUser={(login) => {
                        setCompareUsers(compareUsers.filter(u => u.login !== login));
                        const newRepos = {...compareUserRepos};
                        delete newRepos[login];
                        setCompareUserRepos(newRepos);
                      }}
                    />
                    
                    {/* Classic Comparison */}
                    <div className="mt-8 pt-8 border-t">
                      <h3 className="text-lg font-semibold mb-4">Classic Side-by-Side Comparison</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {compareUsers.map((compUser) => (
                          <Card key={compUser.login}>
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3 mb-3">
                                <Image
                                  src={compUser.avatar_url}
                                  alt={compUser.login}
                                  width={48}
                                  height={48}
                                  className="rounded-full"
                                />
                                <div>
                                  <h4 className="font-semibold">{compUser.name || compUser.login}</h4>
                                  <p className="text-sm text-slate-600">@{compUser.login}</p>
                                </div>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Followers:</span>
                                  <span className="font-medium">{compUser.followers}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Following:</span>
                                  <span className="font-medium">{compUser.following}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Repos:</span>
                                  <span className="font-medium">{compUser.public_repos}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className="flex-1 sm:flex-none"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="ml-1 sm:hidden">{darkMode ? 'Light' : 'Dark'}</span>
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                className="pl-10 h-12 text-base sm:text-lg"
                placeholder="Enter GitHub username to discover amazing profiles..."
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleSearch} 
                disabled={loading}
                size="lg"
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-1 sm:flex-none"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
              
              {user && (
                <div className="flex gap-2">
                  <Button variant="outline" size="lg" className="h-12 flex-1 sm:flex-none" onClick={exportUserData}>
                    <Download className="h-4 w-4 mr-1 sm:mr-0" />
                    <span className="sm:hidden ml-1">Export</span>
                  </Button>
                  <Button variant="outline" size="lg" className="h-12 flex-1 sm:flex-none" onClick={shareProfile}>
                    <Share className="h-4 w-4 mr-1 sm:mr-0" />
                    <span className="sm:hidden ml-1">Share</span>
                  </Button>
                  <Button variant="outline" size="lg" className="h-12 flex-1 sm:flex-none" onClick={addToComparison}>
                    <Users className="h-4 w-4 mr-1 sm:mr-0" />
                    <span className="sm:hidden ml-1">Compare</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Search History */}
          {searchHistory.length > 0 && (
            <div className="mt-4">
              <div className="text-xs text-slate-500 mb-2 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Recent searches:
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((hist) => (
                  <button
                    key={hist}
                    onClick={() => setUsername(hist)}
                    className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center space-x-1"
                  >
                    <Github className="h-3 w-3" />
                    <span>{hist}</span>
                  </button>
                ))}
                <button
                  onClick={() => {
                    setSearchHistory([]);
                    localStorage.removeItem("github-search-history");
                    toast.success("Search history cleared");
                  }}
                  className="px-3 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Fetching GitHub data...</p>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-64 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
          </div>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 mb-6">
            <AlertDescription className="text-red-600 dark:text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {user && (
          <div className="space-y-8">
            {/* Enhanced User Profile Card */}
            <Card className="overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-12">
                  <div className="relative">
                    <Image
                      src={user.avatar_url}
                      alt={user.login}
                      width={140}
                      height={140}
                      className="rounded-full ring-4 ring-white dark:ring-slate-700 shadow-xl"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-green-500 h-8 w-8 rounded-full border-4 border-white dark:border-slate-700 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-3">
                      <h2 className="text-4xl font-bold text-slate-800 dark:text-white">
                        {user.name || user.login}
                      </h2>
                      {user.type === "Organization" && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <Users className="h-3 w-3 mr-1" />
                          Organization
                        </Badge>
                      )}
                      {user.hireable && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Award className="h-3 w-3 mr-1" />
                          Available for hire
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-400 mb-2 flex items-center justify-center lg:justify-start">
                      <span className="mr-2">@{user.login}</span>
                      <button 
                        onClick={() => copyToClipboard(user.login)} 
                        className="hover:text-blue-600"
                        title="Copy username"
                        aria-label="Copy username to clipboard"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </p>
                    
                    {user.bio && (
                      <p className="text-slate-700 dark:text-slate-300 mb-6 max-w-3xl text-lg leading-relaxed">
                        {user.bio}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                      {user.location && (
                        <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{user.location}</span>
                        </div>
                      )}
                      {user.company && (
                        <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{user.company}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>Joined {formatDate(user.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                        <Activity className="h-4 w-4 flex-shrink-0" />
                        <span>{getActivityScore().toFixed(0)}% Active</span>
                      </div>
                    </div>

                    {/* Enhanced Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-8">
                      <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                        <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{user.followers}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Followers</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-950/30 rounded-xl">
                        <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{user.following}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Following</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                        <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">{user.public_repos}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Repositories</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-xl">
                        <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1">{getTotalStars()}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Total Stars</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-red-50 dark:bg-red-950/30 rounded-xl">
                        <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">{user.public_gists || 0}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Gists</div>
                      </div>
                    </div>

                    {/* Activity Score Progress */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Activity Score</span>
                        <span className="text-sm text-slate-500">{getActivityScore().toFixed(0)}%</span>
                      </div>
                      <Progress value={getActivityScore()} className="h-2" />
                    </div>

                    <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3">
                      <a
                        href={user.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-800 dark:bg-white text-white dark:text-slate-800 rounded-xl hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors font-medium"
                      >
                        <Github className="h-5 w-5" />
                        <span>View Profile</span>
                      </a>
                      {user.blog && (
                        <a
                          href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        >
                          <Globe className="h-5 w-5" />
                          <span>Website</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex overflow-x-auto w-full sm:w-auto">
                <div className="flex space-x-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl min-w-max">
                  <button
                    onClick={() => setActiveTab("repos")}
                    className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      activeTab === "repos"
                        ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-md"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Book className="h-4 w-4" />
                      <span className="text-sm sm:text-base">Repos <span className="hidden sm:inline">({filteredRepos.length})</span></span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("stats")}
                    className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      activeTab === "stats"
                        ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-md"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-sm sm:text-base">Stats</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      activeTab === "analytics"
                        ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-md"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <PieChart className="h-4 w-4" />
                      <span className="text-sm sm:text-base">Analytics</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      activeTab === "activity"
                        ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-md"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm sm:text-base">Activity</span>
                    </div>
                  </button>
                </div>
              </div>

              {activeTab === "repos" && (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              )}
            </div>

            {/* Repository Filters */}
            {showFilters && activeTab === "repos" && (
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Search Repositories</label>
                    <Input
                      placeholder="Search repositories..."
                      value={repoFilter}
                      onChange={(e) => setRepoFilter(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Language</label>
                    <select
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Filter by programming language"
                    >
                      <option value="">All Languages</option>
                      {getUniqueLanguages().map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "updated" | "stars" | "forks" | "name")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Sort repositories by"
                    >
                      <option value="updated">Last Updated</option>
                      <option value="stars">Most Stars</option>
                      <option value="forks">Most Forks</option>
                      <option value="name">Name A-Z</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRepoFilter("");
                        setLanguageFilter("");
                        setSortBy("updated");
                      }}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Enhanced Content Sections */}
            {activeTab === "repos" && filteredRepos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRepos.map((repo) => (
                  <Card key={repo.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 hover:underline"
                          >
                            <span>{repo.name}</span>
                            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </CardTitle>
                        <div className="flex space-x-1">
                          {repo.fork && <Badge variant="secondary">Fork</Badge>}
                          {repo.archived && <Badge variant="destructive">Archived</Badge>}
                          {repo.private && <Badge variant="outline">Private</Badge>}
                        </div>
                      </div>
                      {repo.description && (
                        <CardDescription className="line-clamp-2 text-slate-600 dark:text-slate-400">
                          {repo.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Topics */}
                      {repo.topics && repo.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {repo.topics.slice(0, 4).map((topic) => (
                            <Badge
                              key={topic}
                              variant="outline"
                              className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            >
                              {topic}
                            </Badge>
                          ))}
                          {repo.topics.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{repo.topics.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-4">
                          {repo.language && (
                            <div className="flex items-center space-x-1">
                              <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`}></div>
                              <span className="text-slate-600 dark:text-slate-400">{repo.language}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-end space-x-4 text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>{repo.stargazers_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <GitFork className="h-3 w-3" />
                            <span>{repo.forks_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{repo.watchers_count}</span>
                          </div>
                        </div>
                      </div>

                      {/* License and Size */}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center space-x-3">
                          {repo.license && (
                            <div className="flex items-center space-x-1">
                              <Shield className="h-3 w-3" />
                              <span>{repo.license.name}</span>
                            </div>
                          )}
                          <span>{Math.round(repo.size / 1024)} MB</span>
                        </div>
                        <span>Updated {formatDate(repo.updated_at)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Enhanced Statistics Tab */}
            {activeTab === "stats" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Languages Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5" />
                      <span>Language Distribution</span>
                    </CardTitle>
                    <CardDescription>Programming languages used across repositories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getTopLanguages().map(([language, count], index) => {
                        const isTop = index === 0;
                        const widthClass = isTop ? 'w-full' : index === 1 ? 'w-3/4' : index === 2 ? 'w-1/2' : 'w-1/3';
                        return (
                        <div key={language} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${getLanguageColor(language)}`}></div>
                            <span className="font-medium">{language}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full language-progress-bar ${getLanguageColor(language)} ${widthClass}`}
                              ></div>
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-400 w-8 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Repository Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Repository Analytics</span>
                    </CardTitle>
                    <CardDescription>Detailed breakdown of repository metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                        <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">{repos.filter(r => !r.fork).length}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Original Repos</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-xl">
                        <GitBranch className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-600">{repos.filter(r => r.fork).length}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Forked Repos</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl">
                        <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-yellow-600">{getTotalStars()}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Total Stars</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl">
                        <GitFork className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-600">{getTotalForks()}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Total Forks</div>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Average Stars per Repo</span>
                        <span className="font-semibold">{(getTotalStars() / repos.length).toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Most Popular Repo</span>
                        <span className="font-semibold">{repos.sort((a, b) => b.stargazers_count - a.stargazers_count)[0]?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Archived Repositories</span>
                        <span className="font-semibold">{repos.filter(r => r.archived).length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* CRAZY Advanced Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-8">
                {/* AI-Powered Insights */}
                <AIInsights repos={repos} user={user} />
                
                {/* Developer Achievements */}
                <DeveloperAchievements repos={repos} user={user} />
                
                {/* Repo Analytics Component */}
                <RepoAnalytics repos={repos} user={user} />
                
                {/* Advanced Analytics Component */}
                <AdvancedAnalytics repos={repos} username={user.login} />
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Recent Activity</span>
                    </CardTitle>
                    <CardDescription>Latest repository updates and contributions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {repos
                        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                        .slice(0, 10)
                        .map((repo) => (
                          <div key={repo.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language || 'Unknown')}`}></div>
                              <div>
                                <a
                                  href={repo.html_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium hover:text-blue-600"
                                >
                                  {repo.name}
                                </a>
                                <p className="text-sm text-slate-500">
                                  {repo.description ? repo.description.slice(0, 60) + '...' : 'No description'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right text-sm text-slate-500">
                              <div>{formatDate(repo.updated_at)}</div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Star className="h-3 w-3" />
                                <span>{repo.stargazers_count}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {!user && !loading && !error && (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center py-12">
              <div className="mb-8">
                <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                  <Github className="h-16 w-16 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
                  Discover Amazing GitHub Profiles
                </h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
                  Explore GitHub profiles with advanced analytics, compare users, and discover trending repositories 
                  with our powerful search tools.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Advanced Analytics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Profile Comparison</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Data Export</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4" />
                    <span>Smart Filters</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trending Developers */}
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                  ⭐ Trending Developers
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Discover profiles of influential developers and open source contributors
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {TRENDING_DEVELOPERS.map((dev) => (
                  <Card 
                    key={dev.login} 
                    className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                    onClick={() => setUsername(dev.login)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="relative mb-4">
                        <Image
                          src={dev.avatar}
                          alt={dev.name}
                          width={80}
                          height={80}
                          className="rounded-full mx-auto ring-4 ring-slate-200 dark:ring-slate-700 group-hover:ring-blue-500 transition-all"
                        />
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-1">
                          <Github className="h-4 w-4" />
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                        {dev.name}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        @{dev.login}
                      </p>
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                        {dev.description}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {dev.category}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Popular Organizations */}
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                  🏢 Popular Organizations
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Explore repositories from leading tech companies and organizations
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                {TRENDING_ORGANIZATIONS.map((org) => (
                  <button
                    key={org.login}
                    onClick={() => setUsername(org.login)}
                    className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200 flex items-center space-x-3 group"
                  >
                    <Image
                      src={org.avatar}
                      alt={org.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                      {org.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Features */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                  🚀 Why Choose GitHunter Pro?
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl w-fit mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-2">Advanced Analytics</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Deep insights into repository metrics, language statistics, and contribution patterns
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl w-fit mx-auto mb-4">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-2">Profile Comparison</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Compare multiple GitHub profiles side by side to identify top talent
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl w-fit mx-auto mb-4">
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-2">Lightning Fast</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Optimized performance with caching and smart data fetching strategies
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
