"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Filter, X, TrendingUp, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  text: string;
  type: 'category' | 'location' | 'popular';
  icon?: React.ReactNode;
}

interface AdvancedSearchProps {
  onSearch: (query: string) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

export interface SearchFilters {
  category: string;
  location: string;
  priceRange: { min: number; max: number };
  type: 'all' | 'task' | 'service';
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'date-new' | 'date-old';
}

const popularSearches = [
  'plumber', 'cleaning', 'delivery', 'tutoring', 'gardening',
  'painting', 'electrical', 'carpentry', 'moving', 'pet care'
];

const categorySuggestions = [
  'Home Services', 'Delivery', 'Tutoring', 'Events', 'Other'
];

export function AdvancedSearch({ onSearch, onFiltersChange, className }: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    location: '',
    priceRange: { min: 0, max: 100000 },
    type: 'all',
    sortBy: 'relevance'
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Generate search suggestions
  const getSuggestions = (): SearchSuggestion[] => {
    const suggestions: SearchSuggestion[] = [];
    
    if (searchQuery.trim()) {
      // Category matches
      categorySuggestions.forEach(category => {
        if (category.toLowerCase().includes(searchQuery.toLowerCase())) {
          suggestions.push({
            text: category,
            type: 'category',
            icon: <TrendingUp className="h-4 w-4" />
          });
        }
      });

      // Popular search matches
      popularSearches.forEach(search => {
        if (search.toLowerCase().includes(searchQuery.toLowerCase())) {
          suggestions.push({
            text: search,
            type: 'popular',
            icon: <Clock className="h-4 w-4" />
          });
        }
      });
    } else {
      // Show popular searches when input is empty
      popularSearches.slice(0, 5).forEach(search => {
        suggestions.push({
          text: search,
          type: 'popular',
          icon: <Clock className="h-4 w-4" />
        });
      });
    }

    return suggestions.slice(0, 8);
  };

  const handleSearch = (query?: string) => {
    const searchTerm = query || searchQuery;
    if (searchTerm.trim()) {
      onSearch(searchTerm);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const handleFiltersChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      category: 'all',
      location: '',
      priceRange: { min: 0, max: 100000 },
      type: 'all',
      sortBy: 'relevance'
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = filters.category !== 'all' || 
    filters.location || 
    filters.priceRange.min > 0 || 
    filters.priceRange.max < 100000 || 
    filters.type !== 'all' || 
    filters.sortBy !== 'relevance';

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = getSuggestions();

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search tasks or services (e.g., plumber, delivery)"
          className="pl-10 pr-20"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <Button
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8"
          onClick={() => handleSearch()}
        >
          Search
        </Button>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <Card ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-2 z-50 p-2">
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-muted flex items-center gap-2 text-sm"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.icon}
                <span className={cn(
                  suggestion.type === 'category' && "font-medium text-primary",
                  suggestion.type === 'popular' && "text-muted-foreground"
                )}>
                  {suggestion.text}
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Filters Toggle */}
      <div className="flex items-center gap-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2",
            showFilters && "bg-primary text-primary-foreground"
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
              !
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mt-3 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFiltersChange({ category: e.target.value })}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                {categorySuggestions.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter location"
                  value={filters.location}
                  onChange={(e) => handleFiltersChange({ location: e.target.value })}
                  className="pl-8 text-sm"
                />
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFiltersChange({ type: e.target.value as any })}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="task">Tasks</option>
                <option value="service">Services</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFiltersChange({ sortBy: e.target.value as any })}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="date-new">Newest First</option>
                <option value="date-old">Oldest First</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2">Price Range</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min || ''}
                  onChange={(e) => handleFiltersChange({
                    priceRange: { ...filters.priceRange, min: Number(e.target.value) || 0 }
                  })}
                  className="text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max || ''}
                  onChange={(e) => handleFiltersChange({
                    priceRange: { ...filters.priceRange, max: Number(e.target.value) || 100000 }
                  })}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                {filters.category !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Category: {filters.category}
                    <button 
                      onClick={() => handleFiltersChange({ category: 'all' })}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.location && (
                  <Badge variant="secondary" className="gap-1">
                    Location: {filters.location}
                    <button 
                      onClick={() => handleFiltersChange({ location: '' })}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.type !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Type: {filters.type === 'task' ? 'Tasks' : 'Services'}
                    <button 
                      onClick={() => handleFiltersChange({ type: 'all' })}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {(filters.priceRange.min > 0 || filters.priceRange.max < 100000) && (
                  <Badge variant="secondary" className="gap-1">
                    Price: ₱{filters.priceRange.min.toLocaleString()} - ₱{filters.priceRange.max.toLocaleString()}
                    <button 
                      onClick={() => handleFiltersChange({
                        priceRange: { min: 0, max: 100000 }
                      })}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.sortBy !== 'relevance' && (
                  <Badge variant="secondary" className="gap-1">
                    Sort: {filters.sortBy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    <button 
                      onClick={() => handleFiltersChange({ sortBy: 'relevance' })}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
} 