import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Swords, Crown, Star, GitBranch, Users, Trophy, 
  Target, Zap, Shield, Flame 
} from 'lucide-react';

interface User {
  login: string;
  name: string;
  avatar_url: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
}

interface Repo {
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
}

interface BattleMetric {
  name: string;
  icon: React.ReactNode;
  calculate: (user: User, repos: Repo[]) => number;
  format: (value: number) => string;
  color: string;
}

interface DeveloperBattleProps {
  users: User[];
  userRepos: { [key: string]: Repo[] };
  onRemoveUser: (login: string) => void;
}

interface BattleStats {
  user: User;
  repos: Repo[];
  overallScore: number;
  metrics: Array<BattleMetric & { value: number }>;
}

export const DeveloperBattle: React.FC<DeveloperBattleProps> = ({ 
  users, 
  userRepos, 
  onRemoveUser 
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('overall');
  
  const battleMetrics: BattleMetric[] = [
    {
      name: 'Star Power',
      icon: <Star className="h-5 w-5" />,
      calculate: (user, repos) => repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      format: (value) => value.toLocaleString(),
      color: 'text-yellow-500'
    },
    {
      name: 'Fork Force',
      icon: <GitBranch className="h-5 w-5" />,
      calculate: (user, repos) => repos.reduce((sum, repo) => sum + repo.forks_count, 0),
      format: (value) => value.toLocaleString(),
      color: 'text-green-500'
    },
    {
      name: 'Social Influence',
      icon: <Users className="h-5 w-5" />,
      calculate: (user) => user.followers,
      format: (value) => value.toLocaleString(),
      color: 'text-blue-500'
    },
    {
      name: 'Repository Count',
      icon: <Shield className="h-5 w-5" />,
      calculate: (user) => user.public_repos,
      format: (value) => value.toString(),
      color: 'text-purple-500'
    },
    {
      name: 'Activity Score',
      icon: <Flame className="h-5 w-5" />,
      calculate: (user, repos) => {
        const recentRepos = repos.filter(repo => {
          const lastUpdate = new Date(repo.updated_at);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          return lastUpdate > sixMonthsAgo;
        });
        return Math.round((recentRepos.length / Math.max(repos.length, 1)) * 100);
      },
      format: (value) => `${value}%`,
      color: 'text-red-500'
    }
  ];

  const calculateOverallScore = (user: User, repos: Repo[]) => {
    const stars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const forks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    const followers = user.followers;
    const repoCount = user.public_repos;
    
    // Weighted scoring algorithm
    return Math.round(
      (stars * 0.3) + 
      (forks * 0.2) + 
      (followers * 0.3) + 
      (repoCount * 0.2)
    );
  };

  const getUserStats = (user: User): BattleStats => {
    const repos = userRepos[user.login] || [];
    const overallScore = calculateOverallScore(user, repos);
    
    return {
      user,
      repos,
      overallScore,
      metrics: battleMetrics.map(metric => ({
        ...metric,
        value: metric.calculate(user, repos)
      }))
    };
  };

  const battleStats: BattleStats[] = users.map(getUserStats);
  const winner = battleStats.reduce((prev: BattleStats, current: BattleStats) => 
    current.overallScore > prev.overallScore ? current : prev
  );

  const getWinnerForMetric = (metricName: string): BattleStats => {
    return battleStats.reduce((prev: BattleStats, current: BattleStats) => {
      const prevValue = prev.metrics.find((m: BattleMetric & { value: number }) => m.name === metricName)?.value || 0;
      const currentValue = current.metrics.find((m: BattleMetric & { value: number }) => m.name === metricName)?.value || 0;
      return currentValue > prevValue ? current : prev;
    });
  };

  if (users.length < 2) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Swords className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
            Developer Battle Arena
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Add at least 2 developers to start an epic battle comparison!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Battle Header */}
      <Card className="overflow-hidden bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-2">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-full">
              <Swords className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Developer Battle Arena</CardTitle>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Epic showdown between {users.length} developers across multiple metrics
          </p>
        </CardHeader>
      </Card>

      {/* Metric Selector */}
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant={selectedMetric === 'overall' ? 'default' : 'outline'}
          onClick={() => setSelectedMetric('overall')}
          className="flex items-center space-x-2"
        >
          <Crown className="h-4 w-4" />
          <span>Overall Winner</span>
        </Button>
        {battleMetrics.map((metric) => (
          <Button
            key={metric.name}
            variant={selectedMetric === metric.name ? 'default' : 'outline'}
            onClick={() => setSelectedMetric(metric.name)}
            className="flex items-center space-x-2"
          >
            {metric.icon}
            <span>{metric.name}</span>
          </Button>
        ))}
      </div>

      {/* Battle Results */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMetric}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {battleStats
            .sort((a: BattleStats, b: BattleStats) => {
              if (selectedMetric === 'overall') {
                return b.overallScore - a.overallScore;
              }
              const aValue = a.metrics.find((m: BattleMetric & { value: number }) => m.name === selectedMetric)?.value || 0;
              const bValue = b.metrics.find((m: BattleMetric & { value: number }) => m.name === selectedMetric)?.value || 0;
              return bValue - aValue;
            })
            .map((stats: BattleStats, index: number) => {
              const isWinner = selectedMetric === 'overall' 
                ? stats.user.login === winner.user.login
                : stats.user.login === getWinnerForMetric(selectedMetric).user.login;
              
              const selectedMetricData = selectedMetric === 'overall' 
                ? { value: stats.overallScore, format: (v: number) => v.toLocaleString() }
                : stats.metrics.find((m: BattleMetric & { value: number }) => m.name === selectedMetric)!;

              return (
                <motion.div
                  key={stats.user.login}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`relative transition-all duration-300 ${
                    isWinner 
                      ? 'ring-4 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 shadow-lg' 
                      : 'hover:shadow-md'
                  }`}>
                    {isWinner && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2">
                        <Crown className="h-6 w-6 text-white" />
                      </div>
                    )}
                    
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="relative">
                          <Image
                            src={stats.user.avatar_url}
                            alt={stats.user.login}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full ring-2 ring-slate-200 dark:ring-slate-700"
                          />
                          {index === 0 && (
                            <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1">
                              <Trophy className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{stats.user.name || stats.user.login}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">@{stats.user.login}</p>
                          <Badge variant={isWinner ? 'default' : 'secondary'} className="mt-1">
                            #{index + 1} Place
                          </Badge>
                        </div>
                      </div>

                      {/* Featured Metric */}
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
                          {selectedMetricData.format(selectedMetricData.value)}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {selectedMetric === 'overall' ? 'Overall Score' : selectedMetric}
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                          <div className="font-semibold text-blue-600">{stats.user.followers}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Followers</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 dark:bg-green-950/20 rounded">
                          <div className="font-semibold text-green-600">{stats.user.public_repos}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Repos</div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveUser(stats.user.login)}
                        className="w-full mt-4"
                      >
                        Remove from Battle
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
        </motion.div>
      </AnimatePresence>

      {/* Battle Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Battle Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <Crown className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Overall Champion</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {winner.user.name || winner.user.login}
              </p>
              <p className="text-xs text-yellow-600">
                Score: {winner.overallScore.toLocaleString()}
              </p>
            </div>

            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">Total Developers</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {users.length} in Battle
              </p>
            </div>

            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-800 dark:text-green-200">Combined Stars</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                {battleStats.reduce((sum, stats) => 
                  sum + stats.repos.reduce((repoSum, repo) => repoSum + repo.stargazers_count, 0), 0
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
