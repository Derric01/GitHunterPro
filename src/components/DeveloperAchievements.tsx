import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, Star, Zap, Target, Rocket, Crown, Shield, Award, 
  Flame, GitBranch, Users, Code, TrendingUp 
} from 'lucide-react';

interface Repo {
  name: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  created_at: string;
  updated_at: string;
  size: number;
  open_issues_count: number;
}

interface User {
  login: string;
  name: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  achieved: boolean;
  progress?: number;
  maxProgress?: number;
}

interface DeveloperAchievementsProps {
  repos: Repo[];
  user: User;
}

export const DeveloperAchievements: React.FC<DeveloperAchievementsProps> = ({ repos, user }) => {
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  const languages = [...new Set(repos.map(repo => repo.language).filter(Boolean))];
  const topRepo = repos.sort((a, b) => b.stargazers_count - a.stargazers_count)[0];
  const accountAge = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365));

  const achievements: Achievement[] = [
    {
      id: 'stargazer',
      title: '⭐ Star Collector',
      description: 'Earned 100+ stars across repositories',
      icon: <Star className="h-6 w-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      achieved: totalStars >= 100,
      progress: Math.min(totalStars, 100),
      maxProgress: 100
    },
    {
      id: 'popular',
      title: '🔥 Viral Developer',
      description: 'Has a repository with 50+ stars',
      icon: <Flame className="h-6 w-6" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      achieved: topRepo?.stargazers_count >= 50,
    },
    {
      id: 'polyglot',
      title: '🌍 Polyglot Programmer',
      description: 'Codes in 5+ programming languages',
      icon: <Code className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      achieved: languages.length >= 5,
      progress: Math.min(languages.length, 5),
      maxProgress: 5
    },
    {
      id: 'prolific',
      title: '🚀 Prolific Creator',
      description: 'Created 20+ public repositories',
      icon: <Rocket className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      achieved: user.public_repos >= 20,
      progress: Math.min(user.public_repos, 20),
      maxProgress: 20
    },
    {
      id: 'influencer',
      title: '👥 Community Leader',
      description: 'Has 100+ followers',
      icon: <Users className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      achieved: user.followers >= 100,
      progress: Math.min(user.followers, 100),
      maxProgress: 100
    },
    {
      id: 'forked',
      title: '🍴 Fork Master',
      description: 'Projects forked 50+ times total',
      icon: <GitBranch className="h-6 w-6" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
      achieved: totalForks >= 50,
      progress: Math.min(totalForks, 50),
      maxProgress: 50
    },
    {
      id: 'veteran',
      title: '🏆 GitHub Veteran',
      description: 'Account older than 3 years',
      icon: <Trophy className="h-6 w-6" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20',
      achieved: accountAge >= 3,
    },
    {
      id: 'trendy',
      title: '📈 Trending Developer',
      description: 'Has recent active repositories',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100 dark:bg-pink-900/20',
      achieved: repos.some(repo => {
        const lastUpdate = new Date(repo.updated_at);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return lastUpdate > threeMonthsAgo;
      }),
    }
  ];

  const achievedCount = achievements.filter(a => a.achieved).length;
  const completionRate = (achievedCount / achievements.length) * 100;

  // Calculate developer tier
  const getDeveloperTier = () => {
    if (achievedCount >= 7) return { name: 'Legendary', icon: <Crown className="h-5 w-5" />, color: 'text-purple-600' };
    if (achievedCount >= 5) return { name: 'Expert', icon: <Shield className="h-5 w-5" />, color: 'text-blue-600' };
    if (achievedCount >= 3) return { name: 'Advanced', icon: <Award className="h-5 w-5" />, color: 'text-green-600' };
    if (achievedCount >= 1) return { name: 'Novice', icon: <Target className="h-5 w-5" />, color: 'text-yellow-600' };
    return { name: 'Beginner', icon: <Zap className="h-5 w-5" />, color: 'text-gray-600' };
  };

  const tier = getDeveloperTier();

  return (
    <div className="space-y-6">
      {/* Developer Tier Card */}
      <Card className="overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className={`p-3 rounded-full bg-white dark:bg-slate-800 ${tier.color}`}>
              {tier.icon}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">{tier.name} Developer</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {achievedCount} of {achievements.length} achievements unlocked
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm mb-2">
              <span>Achievement Progress</span>
              <span>{completionRate.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`transition-all duration-300 hover:shadow-lg ${
              achievement.achieved 
                ? 'ring-2 ring-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20' 
                : 'opacity-75 hover:opacity-100'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${achievement.bgColor} ${achievement.color} flex-shrink-0`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-sm">{achievement.title}</h3>
                      {achievement.achieved && (
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      {achievement.description}
                    </p>
                    
                    {/* Progress bar for progressive achievements */}
                    {achievement.progress !== undefined && achievement.maxProgress && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{achievement.progress}</span>
                          <span>{achievement.maxProgress}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
                          <motion.div
                            className={`h-1 rounded-full ${achievement.achieved ? 'bg-green-500' : 'bg-slate-400'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Special Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Special Recognition</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Most Starred Repo */}
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Most Popular</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {topRepo?.name || 'No repos'} ({topRepo?.stargazers_count || 0} ⭐)
              </p>
            </div>

            {/* Favorite Language */}
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Code className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">Favorite Language</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {languages[0] || 'Unknown'}
              </p>
            </div>

            {/* Collaboration Score */}
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-800 dark:text-green-200">Collaboration</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                {Math.round((user.followers / Math.max(user.following, 1)) * 100)}% Influence
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
