import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, TrendingUp, Target, Lightbulb, Sparkles, 
  BarChart3, Users, Star, AlertTriangle 
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
  description: string;
}

interface User {
  login: string;
  name: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
}

interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'strength' | 'opportunity' | 'trend' | 'recommendation';
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  confidence: number;
}

interface AIInsightsProps {
  repos: Repo[];
  user: User;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ repos, user }) => {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    
    // Calculate metrics
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const avgStars = totalStars / repos.length || 0;
    const languages = repos.map(repo => repo.language).filter(Boolean);
    const languageStats = languages.reduce((acc, lang) => {
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topLanguage = Object.entries(languageStats).sort(([,a], [,b]) => b - a)[0]?.[0];
    
    // Recent activity
    const recentRepos = repos.filter(repo => {
      const lastUpdate = new Date(repo.updated_at);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return lastUpdate > sixMonthsAgo;
    });
    
    const followersToRepoRatio = user.followers / Math.max(user.public_repos, 1);
    
    // Generate dynamic insights based on data
    
    // Strength: High star average
    if (avgStars > 10) {
      insights.push({
        id: 'high-quality',
        title: '🌟 High-Quality Projects',
        description: `Your repositories average ${avgStars.toFixed(1)} stars, indicating strong project quality and community appeal.`,
        type: 'strength',
        icon: <Star className="h-5 w-5" />,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        confidence: Math.min(95, 70 + (avgStars * 2))
      });
    }
    
    // Opportunity: Low activity
    if (recentRepos.length < repos.length * 0.3) {
      insights.push({
        id: 'increase-activity',
        title: '⚡ Activity Opportunity',
        description: `Only ${Math.round((recentRepos.length / repos.length) * 100)}% of your repos have recent activity. Consider updating or archiving inactive projects.`,
        type: 'opportunity',
        icon: <TrendingUp className="h-5 w-5" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        confidence: 85
      });
    }
    
    // Trend: Language specialization
    if (topLanguage && languageStats[topLanguage] > repos.length * 0.4) {
      insights.push({
        id: 'language-expert',
        title: '🎯 Language Specialist',
        description: `You're specializing in ${topLanguage} (${Math.round((languageStats[topLanguage] / repos.length) * 100)}% of repos). This creates strong domain expertise.`,
        type: 'trend',
        icon: <Target className="h-5 w-5" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        confidence: 90
      });
    }
    
    // Recommendation: Social engagement
    if (followersToRepoRatio < 2) {
      insights.push({
        id: 'grow-community',
        title: '👥 Community Growth',
        description: `Your follower-to-repo ratio is ${followersToRepoRatio.toFixed(1)}. Consider sharing your work more actively to grow your developer community.`,
        type: 'recommendation',
        icon: <Users className="h-5 w-5" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        confidence: 75
      });
    }
    
    // Trend: Repository diversity
    if (Object.keys(languageStats).length >= 5) {
      insights.push({
        id: 'polyglot-advantage',
        title: '🌈 Polyglot Advantage',
        description: `You work with ${Object.keys(languageStats).length} programming languages, showcasing versatility and adaptability.`,
        type: 'trend',
        icon: <Sparkles className="h-5 w-5" />,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        confidence: 88
      });
    }
    
    // Opportunity: Large repos
    const largeRepos = repos.filter(repo => repo.size > 10000);
    if (largeRepos.length > repos.length * 0.3) {
      insights.push({
        id: 'repo-optimization',
        title: '🔧 Repository Optimization',
        description: `${largeRepos.length} repositories are quite large. Consider optimizing code structure and removing unnecessary files.`,
        type: 'opportunity',
        icon: <AlertTriangle className="h-5 w-5" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        confidence: 70
      });
    }
    
    // Strength: Consistent creation
    const accountAge = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365));
    const reposPerYear = user.public_repos / Math.max(accountAge, 1);
    if (reposPerYear > 5) {
      insights.push({
        id: 'prolific-creator',
        title: '🚀 Prolific Creator',
        description: `You create an average of ${reposPerYear.toFixed(1)} repositories per year, showing consistent productivity and creativity.`,
        type: 'strength',
        icon: <BarChart3 className="h-5 w-5" />,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        confidence: 82
      });
    }
    
    return insights.slice(0, 6); // Limit to top 6 insights
  };

  const insights = generateInsights();
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strength': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'opportunity': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'trend': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200';
      case 'recommendation': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const overallScore = insights.reduce((sum, insight) => sum + insight.confidence, 0) / insights.length;

  return (
    <div className="space-y-6">
      {/* AI Overview Card */}
      <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">AI-Powered Profile Analysis</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Intelligent insights based on your GitHub activity and patterns
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">{insights.length}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Insights Generated</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">{overallScore.toFixed(0)}%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Analysis Confidence</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {insights.filter(i => i.type === 'strength').length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Key Strengths</div>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="bg-white dark:bg-slate-800"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Refresh Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`transition-all duration-300 hover:shadow-lg cursor-pointer ${
                selectedInsight === insight.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
              onClick={() => setSelectedInsight(selectedInsight === insight.id ? null : insight.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${insight.bgColor} ${insight.color} flex-shrink-0`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{insight.title}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeColor(insight.type)}>
                          {insight.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence}% confident
                        </Badge>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {insight.description}
                    </p>
                    
                    {/* Confidence Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>AI Confidence</span>
                        <span>{insight.confidence}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
                        <motion.div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${insight.confidence}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedInsight === insight.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700"
                  >
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                        Actionable Recommendations
                      </h4>
                      <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        {insight.type === 'strength' && (
                          <p>• Leverage this strength by showcasing it in your profile README</p>
                        )}
                        {insight.type === 'opportunity' && (
                          <p>• Consider this as your next area of focus for improvement</p>
                        )}
                        {insight.type === 'trend' && (
                          <p>• This trend positions you well in the developer community</p>
                        )}
                        {insight.type === 'recommendation' && (
                          <p>• Implementing this suggestion could boost your profile visibility</p>
                        )}
                        <p>• Share this insight with your network to start conversations</p>
                        <p>• Track progress over time by bookmarking this analysis</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Disclaimer */}
      <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Brain className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <strong>AI Analysis Note:</strong> These insights are generated using algorithmic analysis of your public GitHub data. 
              They&apos;re designed to provide helpful perspectives and suggestions, but should be considered alongside your own understanding 
              of your development journey and goals.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
