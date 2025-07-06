"use client";

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { init, SearchIndex } from 'emoji-mart';
import data from '@emoji-mart/data';

// Initialize emoji-mart data
init({ data });

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

// Emoji categories for better organization
const emojiCategories = [
  {
    name: 'Popular',
    emojis: ['👍', '❤️', '😂', '😮', '🎉', '🔥', '👏', '🚀', '💯', '✨', '⭐', '🌟'],
  },
  {
    name: 'Smileys & People',
    search: ['smile', 'happy', 'sad', 'angry', 'love', 'laugh', 'cry', 'wink'],
  },
  {
    name: 'Animals & Nature',
    search: ['animal', 'nature', 'plant', 'flower', 'tree', 'cat', 'dog', 'bird'],
  },
  {
    name: 'Food & Drink',
    search: ['food', 'drink', 'fruit', 'pizza', 'coffee', 'cake', 'burger', 'beer'],
  },
  {
    name: 'Activities',
    search: ['sport', 'game', 'music', 'party', 'celebration', 'art', 'book', 'movie'],
  },
  {
    name: 'Travel & Places',
    search: ['travel', 'car', 'plane', 'building', 'city', 'home', 'office', 'beach'],
  },
  {
    name: 'Objects',
    search: ['phone', 'computer', 'book', 'money', 'gift', 'tool', 'key', 'light'],
  },
  {
    name: 'Symbols',
    search: ['heart', 'star', 'fire', 'checkmark', 'warning', 'question', 'exclamation'],
  },
];

export function EmojiPicker({ onEmojiSelect, className }: EmojiPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Popular');
  const [availableEmojis, setAvailableEmojis] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load emojis when component mounts, category changes, or search term changes
  useEffect(() => {
    const loadEmojis = async () => {
      setIsLoading(true);
      try {
        if (searchTerm.trim()) {
          // Search for emojis using emoji-mart
          const searchResults = await SearchIndex.search(searchTerm);
          if (searchResults && searchResults.length > 0) {
            const emojis = searchResults.map((emoji: any) => emoji.skins[0].native).slice(0, 48);
            setAvailableEmojis(emojis);
          } else {
            setAvailableEmojis([]);
          }
        } else {
          // Load category-specific emojis
          const category = emojiCategories.find(cat => cat.name === activeCategory);
          if (category) {
            if (category.emojis) {
              // Use predefined emojis for Popular category
              setAvailableEmojis(category.emojis);
            } else if (category.search) {
              // Search for emojis in this category
              const allEmojis: string[] = [];
              
              for (const searchTerm of category.search) {
                const results = await SearchIndex.search(searchTerm);
                if (results && results.length > 0) {
                  const emojis = results.map((emoji: any) => emoji.skins[0].native).slice(0, 6);
                  allEmojis.push(...emojis);
                }
              }
              
              // Remove duplicates and limit to 48 emojis
              const uniqueEmojis = [...new Set(allEmojis)].slice(0, 48);
              setAvailableEmojis(uniqueEmojis);
            }
          }
        }
      } catch (error) {
        console.error('Error loading emojis:', error);
        // Fallback to popular emojis if there's an error
        setAvailableEmojis(['👍', '❤️', '😂', '😮', '🎉', '🔥', '👏', '🚀', '💯', '✨', '⭐', '🌟']);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmojis();
  }, [searchTerm, activeCategory]);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
  };

    return (
    <div className={cn("space-y-3 w-full max-w-lg bg-white border border-gray-200 rounded-lg shadow-lg p-4", className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search emojis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      {!searchTerm && (
        <div className="flex flex-wrap gap-1">
          {emojiCategories.map((category) => (
            <Button
              key={category.name}
              type="button"
              variant={activeCategory === category.name ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory(category.name)}
              className="text-xs h-7 px-2"
            >
              {category.name}
            </Button>
          ))}
        </div>
      )}

       {/* Emojis Grid - Exact same as icon picker */}
       <div className="h-48 overflow-y-auto">
         {isLoading ? (
           <div className="flex items-center justify-center h-full">
             <div className="text-sm text-gray-500">Loading emojis...</div>
           </div>
         ) : availableEmojis.length > 0 ? (
           <div className="grid grid-cols-12 gap-2 p-2">
             {availableEmojis.map((emoji, index) => (
               <button
                 key={`${emoji}-${index}`}
                 type="button"
                 className="w-8 h-8 rounded flex items-center justify-center transition-all hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-800"
                 onClick={() => handleEmojiClick(emoji)}
                 title={emoji}
               >
                 <span className="text-sm">{emoji}</span>
               </button>
             ))}
           </div>
         ) : (
           <div className="flex items-center justify-center h-full">
             <div className="text-sm text-gray-500">
               {searchTerm ? 'No emojis found' : 'No emojis available'}
             </div>
           </div>
         )}
       </div>
    </div>
  );
} 