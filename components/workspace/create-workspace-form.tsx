// Create Workspace Form - 
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function CreateWorkspaceForm() {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          url,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/workspaces/${data.workspace.url}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create workspace');
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
      setError('Failed to create workspace. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Auto-generate URL from name
    const autoUrl = newName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setUrl(autoUrl);
    
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    // Clear error when user starts typing
    if (error) setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Workspace</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="My Company"
              value={name}
              onChange={handleNameChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">Workspace URL</Label>
            <div className="flex items-center">
              <span className="text-muted-foreground text-sm mr-2">
                /workspace/
              </span>
              <Input
                id="url"
                type="text"
                placeholder="my-company"
                value={url}
                onChange={handleUrlChange}
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This will be part of your workspace URL
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-orange text-orange-foreground hover:bg-orange/90"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Workspace'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 