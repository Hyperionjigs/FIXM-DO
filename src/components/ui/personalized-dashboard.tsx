'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { PersonalizationEngine } from '@/lib/animation-library';
import { ImmersiveCard } from './immersive-card';
import { EnhancedButton } from './enhanced-button';
import { 
  Settings, 
  Star, 
  TrendingUp, 
  Users, 
  Calendar, 
  Target,
  Activity,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'stats' | 'chart' | 'list' | 'progress' | 'alert' | 'info';
  content: React.ReactNode;
  priority: number;
  size: 'small' | 'medium' | 'large';
  category: string;
  isVisible: boolean;
  isPinned: boolean;
}

export interface PersonalizedDashboardProps {
  widgets: DashboardWidget[];
  onWidgetUpdate?: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  onLayoutChange?: (layout: DashboardWidget[]) => void;
  showPersonalization?: boolean;
  className?: string;
}

const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
  widgets,
  onWidgetUpdate,
  onLayoutChange,
  showPersonalization = true,
  className,
}) => {
  const [personalizedWidgets, setPersonalizedWidgets] = useState<DashboardWidget[]>(widgets);
  const [personalizationEngine] = useState(() => new PersonalizationEngine());
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'usage' | 'alphabetical'>('priority');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [isDragging, setIsDragging] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  // Load user preferences
  useEffect(() => {
    personalizationEngine.loadFromStorage();
    
    // Apply saved preferences
    const savedLayout = personalizationEngine.getPreference('dashboard-layout');
    if (savedLayout) {
      setPersonalizedWidgets(savedLayout);
    }

    const savedViewMode = personalizationEngine.getPreference('dashboard-view-mode', 'grid');
    setViewMode(savedViewMode);

    const savedSortBy = personalizationEngine.getPreference('dashboard-sort-by', 'priority');
    setSortBy(savedSortBy);
  }, [personalizationEngine]);

  // Save preferences when they change
  useEffect(() => {
    personalizationEngine.setPreference('dashboard-layout', personalizedWidgets);
    personalizationEngine.setPreference('dashboard-view-mode', viewMode);
    personalizationEngine.setPreference('dashboard-sort-by', sortBy);
  }, [personalizedWidgets, viewMode, sortBy, personalizationEngine]);

  // Track widget interactions for learning
  const trackWidgetInteraction = (widgetId: string, interactionType: string) => {
    personalizationEngine.learnFromInteraction(`widget-${widgetId}-${interactionType}`, 1);
    
    // Update widget priority based on usage
    const widget = personalizedWidgets.find(w => w.id === widgetId);
    if (widget) {
      const newPriority = Math.min(widget.priority + 1, 10);
      updateWidget(widgetId, { priority: newPriority });
    }
  };

  const updateWidget = (widgetId: string, updates: Partial<DashboardWidget>) => {
    const updatedWidgets = personalizedWidgets.map(widget =>
      widget.id === widgetId ? { ...widget, ...updates } : widget
    );
    setPersonalizedWidgets(updatedWidgets);
    onWidgetUpdate?.(widgetId, updates);
    onLayoutChange?.(updatedWidgets);
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const widget = personalizedWidgets.find(w => w.id === widgetId);
    if (widget) {
      updateWidget(widgetId, { isVisible: !widget.isVisible });
      trackWidgetInteraction(widgetId, 'visibility-toggle');
    }
  };

  const toggleWidgetPin = (widgetId: string) => {
    const widget = personalizedWidgets.find(w => w.id === widgetId);
    if (widget) {
      updateWidget(widgetId, { isPinned: !widget.isPinned });
      trackWidgetInteraction(widgetId, 'pin-toggle');
    }
  };

  const getWidgetIcon = (type: DashboardWidget['type']) => {
    switch (type) {
      case 'stats': return <TrendingUp className="w-5 h-5" />;
      case 'chart': return <Activity className="w-5 h-5" />;
      case 'list': return <Users className="w-5 h-5" />;
      case 'progress': return <Target className="w-5 h-5" />;
      case 'alert': return <AlertCircle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getWidgetColor = (type: DashboardWidget['type']) => {
    switch (type) {
      case 'stats': return 'from-blue-500 to-blue-600';
      case 'chart': return 'from-green-500 to-green-600';
      case 'list': return 'from-purple-500 to-purple-600';
      case 'progress': return 'from-orange-500 to-orange-600';
      case 'alert': return 'from-red-500 to-red-600';
      case 'info': return 'from-cyan-500 to-cyan-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // Filter and sort widgets
  const filteredWidgets = personalizedWidgets
    .filter(widget => 
      widget.isVisible && 
      (selectedCategory === 'all' || widget.category === selectedCategory)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'usage':
          const aUsage = personalizationEngine.getPrediction(`widget-${a.id}-click`) || 0;
          const bUsage = personalizationEngine.getPrediction(`widget-${b.id}-click`) || 0;
          return bUsage - aUsage;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'priority':
        default:
          return b.priority - a.priority;
      }
    });

  // Get unique categories
  const categories = ['all', ...new Set(personalizedWidgets.map(w => w.category))];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Personalized for your workflow
          </p>
        </div>
        
        {showPersonalization && (
          <EnhancedButton
            variant="outline"
            icon={<Settings className="w-4 h-4" />}
            onClick={() => setShowSettings(!showSettings)}
            hoverEffect="glow"
          >
            Personalize
          </EnhancedButton>
        )}
      </div>

      {/* Personalization Settings */}
      {showSettings && showPersonalization && (
        <ImmersiveCard
          variant="glass"
          animation="slideInDown"
          className="mb-6"
        >
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dashboard Settings</h3>
            
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="priority">Priority</option>
                <option value="usage">Usage</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium mb-2">View Mode</label>
              <div className="flex gap-2">
                {(['grid', 'list', 'compact'] as const).map(mode => (
                  <EnhancedButton
                    key={mode}
                    variant={viewMode === mode ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    hoverEffect="scale"
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </EnhancedButton>
                ))}
              </div>
            </div>
          </div>
        </ImmersiveCard>
      )}

      {/* Widgets Grid */}
      <div className={cn(
        'grid gap-6',
        {
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': viewMode === 'grid',
          'grid-cols-1': viewMode === 'list',
          'grid-cols-2 md:grid-cols-4 lg:grid-cols-6': viewMode === 'compact',
        }
      )}>
        {filteredWidgets.map((widget) => (
          <ImmersiveCard
            key={widget.id}
            variant="default"
            animation="fadeIn"
            hoverEffect="lift"
            tilt={true}
            className={cn(
              'cursor-pointer transition-all duration-300',
              {
                'col-span-1': widget.size === 'small' || viewMode === 'compact',
                'col-span-2': widget.size === 'medium' && viewMode === 'grid',
                'col-span-3': widget.size === 'large' && viewMode === 'grid',
                'md:col-span-2': widget.size === 'medium' && viewMode === 'list',
                'md:col-span-3': widget.size === 'large' && viewMode === 'list',
              }
            )}
            onClick={() => trackWidgetInteraction(widget.id, 'click')}
          >
            {/* Widget Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'p-2 rounded-lg bg-gradient-to-r',
                  getWidgetColor(widget.type)
                )}>
                  {getWidgetIcon(widget.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {widget.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {widget.category}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {widget.isPinned && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
                <EnhancedButton
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWidgetPin(widget.id);
                  }}
                  hoverEffect="scale"
                >
                  {widget.isPinned ? 'Unpin' : 'Pin'}
                </EnhancedButton>
                <EnhancedButton
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWidgetVisibility(widget.id);
                  }}
                  hoverEffect="scale"
                >
                  Hide
                </EnhancedButton>
              </div>
            </div>

            {/* Widget Content */}
            <div className={cn(
              'space-y-2',
              {
                'text-sm': viewMode === 'compact',
                'text-base': viewMode !== 'compact',
              }
            )}>
              {widget.content}
            </div>

            {/* Widget Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>Priority: {widget.priority}</span>
              </div>
              
              {widget.isPinned && (
                <div className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Pinned</span>
                </div>
              )}
            </div>
          </ImmersiveCard>
        ))}
      </div>

      {/* Empty State */}
      {filteredWidgets.length === 0 && (
        <ImmersiveCard
          variant="glass"
          className="text-center py-12"
        >
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              No widgets to display
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or add some widgets to get started.
            </p>
          </div>
        </ImmersiveCard>
      )}
    </div>
  );
};

export { PersonalizedDashboard }; 