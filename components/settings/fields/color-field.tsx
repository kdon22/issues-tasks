import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import React from 'react';

export function ColorField({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  const colorVal = value || '#6B7280';
  return (
    <div className="flex items-center gap-2">
      <ColorPicker
        selectedColor={colorVal}
        onColorSelect={onChange}
      />
      <Input
        value={colorVal}
        onChange={e => onChange(e.target.value)}
        placeholder="#6B7280"
        className="font-mono"
      />
    </div>
  );
} 