"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Check, ChevronDown } from "lucide-react";
import { TaskCategoryEnum } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Helper function to get category group names
const getCategoryGroupName = (emoji: string): string => {
  const groupNames: Record<string, string> = {
    '🔧': 'Construction & Carpentry',
    '🧰': 'Mechanical & Electrical',
    '🧼': 'Services & Maintenance',
    '🧑‍🍳': 'Hospitality & Culinary',
    '💅': 'Beauty & Wellness',
    '📦': 'Logistics & Transport',
    '⚙️': 'Technical and Industrial',
    '🏗️': 'High-risk Construction',
    '🛠️': 'Precision Trades',
    '🚢': 'Maritime',
    '🖥️': 'Tech-Related',
    '🧑‍⚕️': 'Healthcare Support',
    '🏥': 'Medical & Wellness Home Services',
    '🧪': 'Food & Beverage (Specialty)',
    '📚': 'Education and Training',
    '🎉': 'Events Planning and Hospitality',
    '🎨': 'Creative Arts, Media and Entertainment Services',
    '📋': 'Other'
  };
  return groupNames[emoji] || 'Other';
};

export function CategoryAutocomplete({
  value,
  onChange,
  placeholder = "Search and select a category...",
  disabled = false,
  className
}: CategoryAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter categories based on search term
  const filteredCategories = TaskCategoryEnum.options.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group categories by emoji for better organization
  const groupedCategories = filteredCategories.reduce((groups, category) => {
    const emoji = category.match(/^[^\w\s]/)?.[0] || '📋';
    if (!groups[emoji]) groups[emoji] = [];
    groups[emoji].push(category);
    return groups;
  }, {} as Record<string, string[]>);

  // Flatten categories for keyboard navigation
  const flatCategories = filteredCategories;

  useEffect(() => {
    // Set search term when value changes (e.g., from AI suggestions)
    if (value && !searchTerm) {
      setSearchTerm(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setIsOpen(true);
    setHighlightedIndex(-1);

    // If user clears the input, clear the selected value
    if (!newSearchTerm) {
      onChange("");
    }
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < flatCategories.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : flatCategories.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && flatCategories[highlightedIndex]) {
          handleSelectCategory(flatCategories[highlightedIndex]);
        } else if (filteredCategories.length === 1) {
          // Auto-select if only one result
          handleSelectCategory(filteredCategories[0]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectCategory = (category: string) => {
    onChange(category);
    setSearchTerm(category);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setSearchTerm("");
    onChange("");
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const isExactMatch = filteredCategories.length === 1 && 
    filteredCategories[0].toLowerCase() === searchTerm.toLowerCase();

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full pl-10 pr-10 py-3 border rounded-lg bg-background",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isExactMatch && "border-green-500 bg-green-50/50"
          )}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 p-1"
              disabled={disabled}
            >
              ✕
            </button>
          )}
          <ChevronDown 
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )} 
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {filteredCategories.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No categories found
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(groupedCategories).map(([emoji, categories]) => (
                <div key={emoji}>
                  <div className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/30">
                    {emoji} {getCategoryGroupName(emoji)}
                  </div>
                  {categories.map((category, index) => {
                    const flatIndex = flatCategories.indexOf(category);
                    const isHighlighted = flatIndex === highlightedIndex;
                    const isSelected = category === value;
                    
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleSelectCategory(category)}
                        className={cn(
                          "w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors",
                          "flex items-center justify-between",
                          isHighlighted && "bg-muted/50",
                          isSelected && "bg-primary/10 text-primary font-medium"
                        )}
                      >
                        <span className="truncate">{category}</span>
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Results Summary */}
      {searchTerm && filteredCategories.length > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          Found {filteredCategories.length} categor{filteredCategories.length === 1 ? 'y' : 'ies'}
          {isExactMatch && " - Press Enter to select"}
        </div>
      )}
    </div>
  );
} 