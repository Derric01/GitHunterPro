import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, GitFork, TrendingUp, Zap, Flame, Target, Rocket } from 'lucide-react';

interface Repo {
  name: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  created_at: string;
  updated_at: string;
  size: number;
  open_issues_count: number;
  description: string;
}

interface User {
  login: string;
  name: string;
  followers: number;
  following: number;
  public_repos: number;
}

interface RepoAnalyticsProps {
  repos: Repo[];
  user: User;
}

export const RepoAnalytics: React.FC<RepoAnalyticsProps> = ({ repos, user }) => {
  const [selectedMetric, setSelectedMetric] = useState<'stars' | 'forks' | 'activity' | 'impact'>('stars');
  const [animatedStats, setAnimatedStats] = useState({
    totalStars: 0,
    totalForks: 0,
    avgRepoScore: 0,
    devScore: 0
  });

  // Calculate crazy advanced metrics
  const calculateAdvancedMetrics = () => {
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    
    // Developer Impact Score (custom algorithm)
    const impactScore = Math.min(100, (
      (totalStars * 0.4) + 
      (totalForks * 0.3) + 
      (user.followers * 0.2) + 
      (repos.length * 0.1)
    ) / 10);

    // Repository Quality Score
    const avgRepoScore = repos.length > 0 ? repos.reduce((sum, repo) => {
      const stars = repo.stargazers_count;
      const forks = repo.forks_count;
      const hasDescription = repo.description ? 1 : 0;
      const recentActivity = isRecentlyActive(repo) ? 1 : 0;
      return sum + (stars * 0.4 + forks * 0.3 + hasDescription * 0.2 + recentActivity * 0.1);
    }, 0) / repos.length : 0;

    return {
      totalStars,
      totalForks,
      impactScore,
      avgRepoScore: Math.min(100, avgRepoScore),
      consistencyScore: calculateConsistencyScore(),
      trendingScore: calculateTrendingScore(),
      innovationScore: calculateInnovationScore()
    };
  };

  const isRecentlyActive = (repo: Repo) => {
    const lastUpdate = new Date(repo.updated_at);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return lastUpdate > threeMonthsAgo;
  };

  const calculateConsistencyScore = () => {
    const activeRepos = repos.filter(isRecentlyActive);
    return Math.min(100, (activeRepos.length / repos.length) * 100);
  };

  const calculateTrendingScore = () => {
    const recentRepos = repos.filter(repo => {
      const created = new Date(repo.created_at);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return created > oneYearAgo;
    });
    const recentStars = recentRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    return Math.min(100, recentStars / 10);
  };

  const calculateInnovationScore = () => {
    const languages = new Set(repos.map(repo => repo.language).filter(Boolean));
    const avgRepoSize = repos.reduce((sum, repo) => sum + repo.size, 0) / repos.length;
    return Math.min(100, (languages.size * 10) + (avgRepoSize / 1000));
  };

  // Animate numbers
  useEffect(() => {
    const metrics = calculateAdvancedMetrics();
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedStats({
        totalStars: Math.floor(metrics.totalStars * easeOutQuart),
        totalForks: Math.floor(metrics.totalForks * easeOutQuart),
        avgRepoScore: Math.floor(metrics.avgRepoScore * easeOutQuart),
        devScore: Math.floor(metrics.impactScore * easeOutQuart)
      });

      currentStep++;
      if (currentStep > steps) {
        clearInterval(interval);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [repos, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const metrics = calculateAdvancedMetrics();

  const getTopReposByMetric = () => {
    switch (selectedMetric) {
      case 'stars':
        return repos.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 5);
      case 'forks':
        return repos.sort((a, b) => b.forks_count - a.forks_count).slice(0, 5);
      case 'activity':
        return repos.filter(isRecentlyActive).slice(0, 5);
      case 'impact':
        return repos.sort((a, b) => 
          (b.stargazers_count + b.forks_count) - (a.stargazers_count + a.forks_count)
        ).slice(0, 5);
      default:
        return repos.slice(0, 5);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    if (score >= 40) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🚀';
    if (score >= 80) return '🔥';
    if (score >= 70) return '⭐';
    if (score >= 60) return '📈';
    if (score >= 50) return '💪';
    return '🎯';
  };

  return (
    <div className="space-y-8">
      {/* Hero Stats with Animations */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Star className="h-8 w-8" />
                <span className="text-2xl">⭐</span>
              </div>
              <div className="text-3xl font-bold">{animatedStats.totalStars.toLocaleString()}</div>
              <div className="text-purple-100">Total Stars</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <GitFork className="h-8 w-8" />
                <span className="text-2xl">🍴</span>
              </div>
              <div className="text-3xl font-bold">{animatedStats.totalForks.toLocaleString()}</div>
              <div className="text-blue-100">Total Forks</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-8 w-8" />
                <span className="text-2xl">{getScoreEmoji(animatedStats.avgRepoScore)}</span>
              </div>
              <div className="text-3xl font-bold">{animatedStats.avgRepoScore}</div>
              <div className="text-green-100">Quality Score</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Rocket className="h-8 w-8" />
                <span className="text-2xl">{getScoreEmoji(animatedStats.devScore)}</span>
              </div>
              <div className="text-3xl font-bold">{animatedStats.devScore}</div>
              <div className="text-orange-100">Impact Score</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Advanced Metrics Dashboard */}
      <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 border-2">
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎯 Advanced Developer Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-4 rounded-xl ${getScoreColor(metrics.consistencyScore)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Consistency Score</span>
                <Zap className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold">{metrics.consistencyScore.toFixed(0)}%</div>
              <div className="text-sm opacity-75">Regular activity pattern</div>
            </div>

            <div className={`p-4 rounded-xl ${getScoreColor(metrics.trendingScore)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Trending Score</span>
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold">{metrics.trendingScore.toFixed(0)}%</div>
              <div className="text-sm opacity-75">Recent popularity growth</div>
            </div>

            <div className={`p-4 rounded-xl ${getScoreColor(metrics.innovationScore)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Innovation Score</span>
                <Flame className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold">{metrics.innovationScore.toFixed(0)}%</div>
              <div className="text-sm opacity-75">Technology diversity</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Repository Explorer */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">🔍 Repository Explorer</CardTitle>
            <div className="flex gap-2">
              {(['stars', 'forks', 'activity', 'impact'] as const).map((metric) => (
                <Button
                  key={metric}
                  variant={selectedMetric === metric ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMetric(metric)}
                  className="capitalize"
                >
                  {metric}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMetric}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {getTopReposByMetric().map((repo, index) => (
                <motion.div
                  key={repo.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{repo.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {repo.description ? repo.description.slice(0, 60) + '...' : 'No description'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {repo.language && (
                      <Badge variant="secondary">{repo.language}</Badge>
                    )}
                    <div className="flex items-center space-x-2 text-sm">
                      <Star className="h-4 w-4" />
                      <span>{repo.stargazers_count}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <GitFork className="h-4 w-4" />
                      <span>{repo.forks_count}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Developer Achievement System */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
        <CardHeader>
          <CardTitle className="text-xl text-orange-700 dark:text-orange-300">
            🏆 Developer Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Star Collector', condition: animatedStats.totalStars >= 100, icon: '⭐', desc: '100+ total stars' },
              { name: 'Fork Master', condition: animatedStats.totalForks >= 50, icon: '🍴', desc: '50+ total forks' },
              { name: 'Consistency King', condition: metrics.consistencyScore >= 80, icon: '👑', desc: '80%+ consistency' },
              { name: 'Innovation Pioneer', condition: metrics.innovationScore >= 70, icon: '🚀', desc: '70%+ innovation' },
              { name: 'Trending Developer', condition: metrics.trendingScore >= 60, icon: '📈', desc: '60%+ trending' },
              { name: 'Quality Focused', condition: metrics.avgRepoScore >= 75, icon: '💎', desc: '75%+ avg quality' },
              { name: 'Multi-Language', condition: new Set(repos.map(r => r.language).filter(Boolean)).size >= 5, icon: '🌐', desc: '5+ languages' },
              { name: 'Prolific Creator', condition: repos.length >= 20, icon: '📚', desc: '20+ repositories' },
            ].map((achievement, index) => (
              <motion.div
                key={achievement.name}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                className={`p-4 rounded-lg text-center transition-all duration-300 ${
                  achievement.condition 
                    ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 ring-2 ring-green-300 dark:ring-green-700' 
                    : 'bg-gray-100 dark:bg-gray-800 opacity-50'
                }`}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <div className="font-semibold">{achievement.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{achievement.desc}</div>
                {achievement.condition && (
                  <div className="mt-2">
                    <Badge className="bg-green-500 hover:bg-green-600">Unlocked!</Badge>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
