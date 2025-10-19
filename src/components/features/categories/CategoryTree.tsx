'use client';

import React, { useState, useEffect } from 'react';
import { CategoryTree as CategoryTreeType } from '@/types/category';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  FolderOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const handleToggle = () => {
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
    <div className="select-none">
      <div
        className={cn(
          'flex items-center space-x-2 py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors',
          isSelected && 'bg-blue-50 border border-blue-200',
          level > 0 && 'ml-4'
        )}
        style={{ paddingLeft: `${level * 1.5}rem` }}
        onClick={handleSelect}
      >
        {/* Expand/Collapse Button */}
        <div className="flex items-center justify-center w-4 h-4">
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={handleToggle}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          ) : (
            <div className="w-4 h-4" />
          )}
        </div>

        {/* Category Icon */}
        <div className="flex items-center justify-center w-4 h-4">
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 text-blue-500" />
            )
          ) : (
            <Package className="h-4 w-4 text-gray-400" />
          )}
        </div>

        {/* Category Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm truncate">{category.name}</span>
            {category.productCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {category.productCount}
              </Badge>
            )}
            {!category.isActive && (
              <Badge variant="outline" className="text-xs">
                Inactive
              </Badge>
            )}
          </div>
          {category.description && (
            <p className="text-xs text-gray-500 truncate">{category.description}</p>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleAdd}
              title="Add subcategory"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleEdit}
              title="Edit category"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleMove}
              title="Move category"
            >
              <Move className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDelete}
              title="Delete category"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="ml-2">
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
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <Button variant="outline" onClick={loadCategories} className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Category Tree</span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
            {showActions && (
              <Button size="sm" onClick={() => onCategoryAdd?.()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
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
          <div className="text-center text-gray-500 py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No categories found</p>
            {showActions && (
              <Button className="mt-2" onClick={() => onCategoryAdd?.()}>
                <Plus className="h-4 w-4 mr-2" />
                Add your first category
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
