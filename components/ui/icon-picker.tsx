"use client";

import { useState, useEffect } from 'react';
import { 
  Search, Hash, Users, Building, Home, Settings, Star, Heart, 
  Zap, Target, Rocket, Shield, Lock, Key, Mail, Phone, Globe,
  Camera, Image, Video, Music, Headphones, Mic, Speaker, Volume2,
  Edit, Trash2, Plus, Minus, X, Check, ChevronRight, ChevronLeft,
  Download, Upload, Share, Link, Copy, Clipboard, Save, Folder,
  File, FileText, Archive, Package, Box, Truck, Car, Plane,
  Train, Bike, Ship, Anchor, Flag, MapPin, Compass, Navigation,
  Clock, Calendar, Bell, AlertCircle, Info, HelpCircle, CircleHelp,
  Lightbulb, Flame, Sun, Moon, Cloud, CloudRain, Snowflake, Umbrella,
  Trees, Flower2, Leaf, Cog, Wrench, Hammer, Wrench as Screwdriver, Scissors,
  Paintbrush, Palette, Brush, Pen, Pencil, Ruler, Calculator, Code,
  Monitor, Smartphone, Tablet, Laptop, Keyboard, Mouse, Printer, Wifi,
  Database, Server, HardDrive, Cpu, MemoryStick, Gamepad2, Trophy,
  Award, Medal, Crown, Gift, ShoppingCart, CreditCard, DollarSign,
  TrendingUp, TrendingDown, BarChart, PieChart, Activity, Zap as Pulse,
  Eye, EyeOff, Bookmark, Tag, Filter, ArrowUpDown, Layout, Grid,
  List, Menu, MoreHorizontal, MoreVertical, Coffee, Pizza
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/ui/color-picker';
import { cn } from '@/lib/utils';
import data from '@emoji-mart/data';
import { init, SearchIndex } from 'emoji-mart';

// Initialize emoji-mart data
init({ data });

interface IconPickerProps {
  selectedIcon?: string;
  selectedColor?: string;
  selectedEmoji?: string;
  selectedAvatarType?: 'INITIALS' | 'ICON' | 'EMOJI' | 'IMAGE';
  onIconSelect?: (icon: string) => void;
  onColorSelect?: (color: string) => void;
  onEmojiSelect?: (emoji: string) => void;
  onAvatarTypeSelect?: (type: 'INITIALS' | 'ICON' | 'EMOJI' | 'IMAGE') => void;
  teamName?: string;
  className?: string;
}

export const iconList = [
  { name: 'Search', icon: Search },
  { name: 'Hash', icon: Hash },
  { name: 'Users', icon: Users },
  { name: 'Building', icon: Building },
  { name: 'Home', icon: Home },
  { name: 'Settings', icon: Settings },
  { name: 'Star', icon: Star },
  { name: 'Heart', icon: Heart },
  { name: 'Zap', icon: Zap },
  { name: 'Target', icon: Target },
  { name: 'Rocket', icon: Rocket },
  { name: 'Shield', icon: Shield },
  { name: 'Lock', icon: Lock },
  { name: 'Key', icon: Key },
  { name: 'Mail', icon: Mail },
  { name: 'Phone', icon: Phone },
  { name: 'Globe', icon: Globe },
  { name: 'Camera', icon: Camera },
  { name: 'Image', icon: Image },
  { name: 'Video', icon: Video },
  { name: 'Music', icon: Music },
  { name: 'Headphones', icon: Headphones },
  { name: 'Mic', icon: Mic },
  { name: 'Speaker', icon: Speaker },
  { name: 'Volume2', icon: Volume2 },
  { name: 'Edit', icon: Edit },
  { name: 'Trash2', icon: Trash2 },
  { name: 'Plus', icon: Plus },
  { name: 'Minus', icon: Minus },
  { name: 'X', icon: X },
  { name: 'Check', icon: Check },
  { name: 'ChevronRight', icon: ChevronRight },
  { name: 'ChevronLeft', icon: ChevronLeft },
  { name: 'Download', icon: Download },
  { name: 'Upload', icon: Upload },
  { name: 'Share', icon: Share },
  { name: 'Link', icon: Link },
  { name: 'Copy', icon: Copy },
  { name: 'Clipboard', icon: Clipboard },
  { name: 'Save', icon: Save },
  { name: 'Folder', icon: Folder },
  { name: 'File', icon: File },
  { name: 'FileText', icon: FileText },
  { name: 'Archive', icon: Archive },
  { name: 'Package', icon: Package },
  { name: 'Box', icon: Box },
  { name: 'Truck', icon: Truck },
  { name: 'Car', icon: Car },
  { name: 'Plane', icon: Plane },
  { name: 'Train', icon: Train },
  { name: 'Bike', icon: Bike },
  { name: 'Ship', icon: Ship },
  { name: 'Anchor', icon: Anchor },
  { name: 'Flag', icon: Flag },
  { name: 'MapPin', icon: MapPin },
  { name: 'Compass', icon: Compass },
  { name: 'Navigation', icon: Navigation },
  { name: 'Clock', icon: Clock },
  { name: 'Calendar', icon: Calendar },
  { name: 'Bell', icon: Bell },
  { name: 'AlertCircle', icon: AlertCircle },
  { name: 'Info', icon: Info },
  { name: 'HelpCircle', icon: HelpCircle },
  { name: 'CircleHelp', icon: CircleHelp },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'Flame', icon: Flame },
  { name: 'Sun', icon: Sun },
  { name: 'Moon', icon: Moon },
  { name: 'Cloud', icon: Cloud },
  { name: 'CloudRain', icon: CloudRain },
  { name: 'Snowflake', icon: Snowflake },
  { name: 'Umbrella', icon: Umbrella },
  { name: 'Trees', icon: Trees },
  { name: 'Flower2', icon: Flower2 },
  { name: 'Leaf', icon: Leaf },
  { name: 'Cog', icon: Cog },
  { name: 'Wrench', icon: Wrench },
  { name: 'Hammer', icon: Hammer },
  { name: 'Screwdriver', icon: Screwdriver },
  { name: 'Scissors', icon: Scissors },
  { name: 'Paintbrush', icon: Paintbrush },
  { name: 'Palette', icon: Palette },
  { name: 'Brush', icon: Brush },
  { name: 'Pen', icon: Pen },
  { name: 'Pencil', icon: Pencil },
  { name: 'Ruler', icon: Ruler },
  { name: 'Calculator', icon: Calculator },
  { name: 'Code', icon: Code },
  { name: 'Monitor', icon: Monitor },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Tablet', icon: Tablet },
  { name: 'Laptop', icon: Laptop },
  { name: 'Keyboard', icon: Keyboard },
  { name: 'Mouse', icon: Mouse },
  { name: 'Printer', icon: Printer },
  { name: 'Wifi', icon: Wifi },
  { name: 'Database', icon: Database },
  { name: 'Server', icon: Server },
  { name: 'HardDrive', icon: HardDrive },
  { name: 'Cpu', icon: Cpu },
  { name: 'MemoryStick', icon: MemoryStick },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Trophy', icon: Trophy },
  { name: 'Award', icon: Award },
  { name: 'Medal', icon: Medal },
  { name: 'Crown', icon: Crown },
  { name: 'Gift', icon: Gift },
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'CreditCard', icon: CreditCard },
  { name: 'DollarSign', icon: DollarSign },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'TrendingDown', icon: TrendingDown },
  { name: 'BarChart', icon: BarChart },
  { name: 'PieChart', icon: PieChart },
  { name: 'Activity', icon: Activity },
  { name: 'Pulse', icon: Pulse },
  { name: 'Eye', icon: Eye },
  { name: 'EyeOff', icon: EyeOff },
  { name: 'Bookmark', icon: Bookmark },
  { name: 'Tag', icon: Tag },
  { name: 'Filter', icon: Filter },
  { name: 'ArrowUpDown', icon: ArrowUpDown },
  { name: 'Layout', icon: Layout },
  { name: 'Grid', icon: Grid },
  { name: 'List', icon: List },
  { name: 'Menu', icon: Menu },
  { name: 'MoreHorizontal', icon: MoreHorizontal },
  { name: 'MoreVertical', icon: MoreVertical },
  { name: 'Coffee', icon: Coffee },
  { name: 'Pizza', icon: Pizza },
];

// Helper function to get icon component by name
export const getIconComponent = (iconName: string) => {
  const iconData = iconList.find(icon => icon.name === iconName);
  return iconData?.icon || Users; // Default to Users if icon not found
};

const avatarOptions = [
  { type: 'geometric', items: ['⬡', '⬢', '⬣', '◯', '◉', '◎', '◐', '◑', '◒', '◓'] },
  { type: 'abstract', items: ['∞', '◊', '◈', '◇', '◆', '▲', '▼', '▶', '◀', '●'] },
  { type: 'symbols', items: ['★', '☆', '✦', '✧', '✩', '✪', '✫', '✬', '✭', '✮'] },
  { type: 'arrows', items: ['→', '←', '↑', '↓', '↗', '↖', '↘', '↙', '↕', '↔'] },
  { type: 'patterns', items: ['◈', '◊', '◉', '◎', '●', '○', '◐', '◑', '◒', '◓'] }
];

export function IconPicker({ 
  selectedIcon, 
  selectedColor = '#6366F1', 
  selectedEmoji,
  selectedAvatarType = 'INITIALS',
  onIconSelect,
  onColorSelect,
  onEmojiSelect,
  onAvatarTypeSelect,
  teamName = '',
  className 
}: IconPickerProps) {
  const [activeTab, setActiveTab] = useState<'icons' | 'emojis' | 'avatar'>('icons');
  const [searchTerm, setSearchTerm] = useState('');
  const [availableEmojis, setAvailableEmojis] = useState<string[]>([]);

  // Load emojis when component mounts or search term changes
  useEffect(() => {
    const loadEmojis = async () => {
      try {
        if (searchTerm.trim()) {
          // Search for emojis using emoji-mart
          const searchResults = await SearchIndex.search(searchTerm);
          if (searchResults && searchResults.length > 0) {
            const emojis = searchResults.map((emoji: any) => emoji.skins[0].native).slice(0, 100);
            setAvailableEmojis(emojis);
          } else {
            setAvailableEmojis([]);
          }
        } else {
          // Load popular emojis when no search term - use common categories
          const popularSearches = ['smile', 'heart', 'fire', 'star', 'rocket', 'thumbs', 'party', 'work', 'home', 'food'];
          const allEmojis: string[] = [];
          
          for (const searchTerm of popularSearches) {
            const results = await SearchIndex.search(searchTerm);
            if (results && results.length > 0) {
              const emojis = results.map((emoji: any) => emoji.skins[0].native).slice(0, 8);
              allEmojis.push(...emojis);
            }
          }
          
          // Remove duplicates and limit to 72 emojis
          const uniqueEmojis = [...new Set(allEmojis)].slice(0, 72);
          setAvailableEmojis(uniqueEmojis);
        }
      } catch (error) {
        console.error('Error loading emojis:', error);
        // Fallback to a basic set if there's an error
        setAvailableEmojis(['🚀', '💻', '🎨', '📱', '🛠️', '📊', '🎯', '💡', '🔧', '📈', '⚡', '🔥', '🌟', '✨', '💫', '⭐', '🌠', '🌙', '☀️', '🌈', '🌊', '🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌿', '🍀', '🌱', '🌳', '🌲', '🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🦄', '🐸', '🐙', '🦋', '🐝', '🎂', '🍕', '☕', '🍎', '🍊', '🍋', '🍌', '🍓', '🥑', '🥕', '🏠', '🏢', '🏰', '🗼', '🎡', '🎢', '🎠', '🎪', '🎭', '🎨', '❤️', '💛', '💚', '💙', '💜', '🤍', '🖤']);
      }
    };

    loadEmojis();
  }, [searchTerm]);

  const filteredIcons = iconList.filter(icon => 
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmojis = availableEmojis; // Already filtered by search term

  const getTeamInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const renderPreview = () => {
    switch (selectedAvatarType) {
      case 'INITIALS':
        return (
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
            style={{ backgroundColor: selectedColor }}
          >
            {teamName ? getTeamInitials(teamName) : 'AB'}
          </div>
        );
      case 'ICON':
        if (selectedIcon) {
          const IconComponent = iconList.find(i => i.name === selectedIcon)?.icon;
          if (IconComponent) {
            return (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <IconComponent className="w-4 h-4" style={{ color: selectedColor }} />
              </div>
            );
          }
        }
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <Hash className="w-4 h-4" style={{ color: selectedColor }} />
          </div>
        );
      case 'EMOJI':
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-gray-100 dark:bg-gray-800">
            {selectedEmoji || '🚀'}
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <Hash className="w-4 h-4" style={{ color: selectedColor }} />
          </div>
        );
    }
  };

  return (
    <div className={cn("space-y-3 w-full max-w-lg", className)}>
      {/* Preview */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <Label className="text-xs font-medium">Preview</Label>
          <div className="mt-1">
            {renderPreview()}
          </div>
        </div>
        
        {/* Color Picker */}
        <div className="flex-1">
          <Label className="text-xs font-medium">Color</Label>
          <div className="mt-1">
            <ColorPicker
              selectedColor={selectedColor}
              onColorSelect={onColorSelect || (() => {})}
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b">
        <Button
          type="button"
          variant={activeTab === 'icons' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('icons')}
          className="rounded-b-none h-7 px-3 text-xs"
        >
          Icons
        </Button>
        <Button
          type="button"
          variant={activeTab === 'emojis' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('emojis')}
          className="rounded-b-none h-7 px-3 text-xs"
        >
          Emojis
        </Button>
        <Button
          type="button"
          variant={activeTab === 'avatar' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('avatar')}
          className="rounded-b-none h-7 px-3 text-xs"
        >
          Avatar
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content */}
      <div className="h-48 overflow-y-auto">
        {activeTab === 'icons' && (
          <div className="grid grid-cols-12 gap-2 p-2">
            {filteredIcons.map((iconData) => {
              const IconComponent = iconData.icon;
              const isSelected = selectedIcon === iconData.name;
              return (
                <button
                  key={iconData.name}
                  type="button"
                  className={cn(
                    "w-8 h-8 rounded flex items-center justify-center transition-all hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-800",
                    isSelected && "ring-2 ring-blue-400 dark:ring-blue-600 bg-gray-100 dark:bg-gray-800"
                  )}
                  onClick={() => {
                    onIconSelect?.(iconData.name);
                  }}
                  title={iconData.name}
                >
                  <IconComponent className="w-3 h-3" style={{ color: selectedColor }} />
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'emojis' && (
          <div className="grid grid-cols-12 gap-2 p-2">
            {filteredEmojis.map((emoji) => {
              const isSelected = selectedEmoji === emoji;
              return (
                <button
                  key={emoji}
                  type="button"
                  className={cn(
                    "w-8 h-8 rounded flex items-center justify-center transition-all hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-800",
                    isSelected && "ring-2 ring-blue-400 dark:ring-blue-600 bg-gray-100 dark:bg-gray-800"
                  )}
                  onClick={() => {
                    onEmojiSelect?.(emoji);
                  }}
                >
                  <span className="text-sm">{emoji}</span>
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'avatar' && (
          <div className="space-y-4 p-2">
            {avatarOptions.map((group) => (
              <div key={group.type} className="space-y-2">
                <Label className="text-xs font-medium text-gray-500 capitalize">
                  {group.type}
                </Label>
                <div className="grid grid-cols-12 gap-2">
                  {group.items.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={cn(
                        "w-8 h-8 rounded flex items-center justify-center transition-all hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-800",
                        selectedEmoji === item && "ring-2 ring-blue-400 dark:ring-blue-600 bg-gray-100 dark:bg-gray-800"
                      )}
                      onClick={() => {
                        onEmojiSelect?.(item);
                      }}
                    >
                      <span className="text-sm font-bold" style={{ color: selectedColor }}>{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 