'use client';

import React, { useState, useEffect } from 'react';
import { CategoryTree as CategoryTreeType } from '@/types/category';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Move,
  Package,
  Folder,
  FolderOpen,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading';

interface CategoryTreeProps {
  onCategorySelect?: (category: CategoryTreeType) => void;
  onCategoryEdit?: (category: CategoryTreeType) => void;
  onCategoryDelete?: (category: CategoryTreeType) => void;
  onCategoryAdd?: (parentId?: string) => void;
  onCategoryMove?: (category: CategoryTreeType) => void;
  showActions?: boolean;
  selectedCategoryId?: string;
  expandedCategories?: string[];
  onExpandedChange?: (expanded: string[]) => void;
}

interface CategoryTreeNodeProps {
  category: CategoryTreeType;
  level: number;
  onCategorySelect?: (category: CategoryTreeType) => void;
  onCategoryEdit?: (category: CategoryTreeType) => void;
  onCategoryDelete?: (category: CategoryTreeType) => void;
  onCategoryAdd?: (parentId?: string) => void;
  onCategoryMove?: (category: CategoryTreeType) => void;
  showActions?: boolean;
  selectedCategoryId?: string;
  expandedCategories: string[];
  onToggleExpanded: (categoryId: string) => void;
}

function CategoryTreeNode({
  category,
  level,
  onCategorySelect,
  onCategoryEdit,
  onCategoryDelete,
  onCategoryAdd,
  onCategoryMove,
  showActions = true,
  selectedCategoryId,
  expandedCategories,
  onToggleExpanded,
}: CategoryTreeNodeProps) {
  const isExpanded = expandedCategories.includes(category.id);
  const isSelected = selectedCategoryId === category.id;
  const hasChildren = category.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggleExpanded(category.id);
    }
  };

  const handleSelect = () => {
    onCategorySelect?.(category);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCategoryEdit?.(category);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCategoryDelete?.(category);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCategoryAdd?.(category.id);
  };

  const handleMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCategoryMove?.(category);
  };

  return (
    <div className="select-none animate-in fade-in slide-in-from-left-2 duration-300">
      <div
        className={cn(
          'group flex items-center space-x-2 py-3 px-4 rounded-xl cursor-pointer transition-all duration-200 border border-transparent',
          isSelected
            ? 'bg-primary/10 border-primary/20 shadow-sm'
            : 'hover:bg-white/5 hover:border-white/10',
          level > 0 && 'ml-6 border-l border-white/5 rounded-l-none'
        )}
        onClick={handleSelect}
      >
        {/* Expand/Collapse Button */}
        <div className="flex items-center justify-center w-6 h-6">
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-white/10 rounded-full"
              onClick={handleToggle}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
            </Button>
          ) : (
            <div className="w-6 h-6" />
          )}
        </div>

        {/* Category Icon */}
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
          isSelected ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground group-hover:text-foreground"
        )}>
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4" />
            ) : (
              <Folder className="h-4 w-4" />
            )
          ) : (
            <Package className="h-4 w-4" />
          )}
        </div>

        {/* Category Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-medium text-sm truncate transition-colors",
              isSelected ? "text-primary" : "text-foreground"
            )}>
              {category.name}
            </span>
            {category.productCount > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-white/5 text-muted-foreground border-white/5">
                {category.productCount}
              </Badge>
            )}
            {!category.isActive && (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-red-500/20 text-red-500 bg-red-500/5">
                Inactive
              </Badge>
            )}
          </div>
          {category.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{category.description}</p>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary rounded-lg"
              onClick={handleAdd}
              title="Add subcategory"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary rounded-lg"
              onClick={handleEdit}
              title="Edit category"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary rounded-lg"
              onClick={handleMove}
              title="Move category"
            >
              <Move className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-red-500/10 hover:text-red-500 rounded-lg"
              onClick={handleDelete}
              title="Delete category"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="ml-4 pl-4 border-l border-white/5 mt-1 space-y-1">
          {category.children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              level={level + 1}
              onCategorySelect={onCategorySelect}
              onCategoryEdit={onCategoryEdit}
              onCategoryDelete={onCategoryDelete}
              onCategoryAdd={onCategoryAdd}
              onCategoryMove={onCategoryMove}
              showActions={showActions}
              selectedCategoryId={selectedCategoryId}
              expandedCategories={expandedCategories}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree({
  onCategorySelect,
  onCategoryEdit,
  onCategoryDelete,
  onCategoryAdd,
  onCategoryMove,
  showActions = true,
  selectedCategoryId,
  expandedCategories: initialExpanded = [],
  onExpandedChange,
}: CategoryTreeProps) {
  const [categories, setCategories] = useState<CategoryTreeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(initialExpanded);

  // Load categories
  const loadCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/categories?tree=true');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch categories');
      }

      setCategories(data.data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadCategories();
  }, []);

  // Handle expanded categories change
  const handleToggleExpanded = (categoryId: string) => {
    const newExpanded = expandedCategories.includes(categoryId)
      ? expandedCategories.filter(id => id !== categoryId)
      : [...expandedCategories, categoryId];

    setExpandedCategories(newExpanded);
    onExpandedChange?.(newExpanded);
  };

  // Expand all categories
  const expandAll = () => {
    const allCategoryIds = (categories: CategoryTreeType[]): string[] => {
      const ids: string[] = [];
      const traverse = (cats: CategoryTreeType[]) => {
        cats.forEach(cat => {
          ids.push(cat.id);
          if (cat.children.length > 0) {
            traverse(cat.children);
          }
        });
      };
      traverse(categories);
      return ids;
    };

    const allIds = allCategoryIds(categories);
    setExpandedCategories(allIds);
    onExpandedChange?.(allIds);
  };

  // Collapse all categories
  const collapseAll = () => {
    setExpandedCategories([]);
    onExpandedChange?.([]);
  };

  if (loading) {
    return (
      <div className="glass-card p-8 flex justify-center items-center min-h-[300px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={loadCategories}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Category Structure</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={expandAll} className="text-muted-foreground hover:text-foreground">
            Expand All
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll} className="text-muted-foreground hover:text-foreground">
            Collapse All
          </Button>
        </div>
      </div>

      <div className="p-4">
        {categories.length > 0 ? (
          <div className="space-y-1">
            {categories.map((category) => (
              <CategoryTreeNode
                key={category.id}
                category={category}
                level={0}
                onCategorySelect={onCategorySelect}
                onCategoryEdit={onCategoryEdit}
                onCategoryDelete={onCategoryDelete}
                onCategoryAdd={onCategoryAdd}
                onCategoryMove={onCategoryMove}
                showActions={showActions}
                selectedCategoryId={selectedCategoryId}
                expandedCategories={expandedCategories}
                onToggleExpanded={handleToggleExpanded}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No categories found</p>
            {showActions && (
              <Button variant="link" className="mt-2 text-primary" onClick={() => onCategoryAdd?.()}>
                Add your first category
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
