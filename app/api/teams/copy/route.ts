import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { sourceTeamId, newTeamData } = await request.json();

    // In a real application, you would:
    // 1. Fetch the source team from the database
    // 2. Copy relevant settings (but not members)
    // 3. Create the new team with copied settings
    // 4. Return the created team

    // Mock response for demonstration
    const copiedSettings = {
      // Settings that would be copied from source team
      avatarType: 'INITIALS',
      avatarColor: '#6366F1',
      avatarEmoji: '🚀',
      avatarIcon: 'users',
      isPrivate: false,
      // Workflow settings, project settings, etc. would also be copied
      workflowSettings: {
        defaultStatuses: ['To Do', 'In Progress', 'Done'],
        automations: [],
      },
      projectSettings: {
        defaultLabels: [],
        issueTypes: [],
      },
      // Note: Members and slack notifications are NOT copied
    };

    // Create new team with copied settings
    const newTeam = {
      id: Date.now().toString(),
      ...newTeamData,
      ...copiedSettings,
      memberCount: 1, // Just the creator
      issueCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      team: newTeam,
      copiedFrom: sourceTeamId,
      message: 'Team created successfully with copied settings'
    });

  } catch (error) {
    console.error('Error copying team:', error);
    return NextResponse.json(
      { error: 'Failed to copy team settings' },
      { status: 500 }
    );
  }
}

// Get copyable settings from a team (without sensitive data)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // In a real application, you would fetch the team from the database
    // Mock response for demonstration
    const teamSettings = {
      id: teamId,
      avatarType: 'INITIALS',
      avatarColor: '#6366F1',
      avatarEmoji: '🚀',
      avatarIcon: 'users',
      isPrivate: false,
      description: 'Example team description',
      workflowSettings: {
        defaultStatuses: ['To Do', 'In Progress', 'Done'],
        automations: [],
      },
      projectSettings: {
        defaultLabels: [],
        issueTypes: [],
      },
    };

    return NextResponse.json({
      success: true,
      settings: teamSettings,
    });

  } catch (error) {
    console.error('Error fetching team settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team settings' },
      { status: 500 }
    );
  }
} 