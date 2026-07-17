import { Challenge, UserChallenge } from '../types';

interface Friend {
  id: string;
  username: string;
  total_xp: number;
  activeChallenges: { title: string; progress: number; status: 'ACTIVE' | 'COMPLETED' | 'FAILED' }[];
}

export const MOCK_CHALLENGES: Challenge[] = [
  { id: '1', title: '10k Morning Run', description: 'Run 10 kilometers every morning before 8am for 30 days straight.', category: 'fitness', creator_id: '1', creator_username: 'yannick', reward_xp: 200, participants_count: 12, duration_days: 30, created_at: new Date().toISOString(), challenge_type: 'local', challenge_mode: 'daily' },
  { id: '2', title: 'Cold Shower Streak', description: 'End every shower with 2 minutes of cold water. No exceptions.', category: 'fitness', creator_id: '2', creator_username: 'ryan', reward_xp: 100, participants_count: 8, duration_days: 21, created_at: new Date().toISOString(), challenge_type: 'local', challenge_mode: 'daily' },
  { id: '3', title: 'Read 20 Pages Daily', description: 'Read at least 20 pages of a non-fiction book every day.', category: 'productivity', creator_id: '3', creator_username: 'nathanael', reward_xp: 150, participants_count: 15, duration_days: 30, created_at: new Date().toISOString(), challenge_type: 'local', challenge_mode: 'daily' },
  { id: '4', title: 'No Social Media Before Noon', description: 'Stay off all social media platforms until 12:00 PM every day.', category: 'productivity', creator_id: '1', creator_username: 'yannick', reward_xp: 120, participants_count: 20, duration_days: 14, created_at: new Date().toISOString(), challenge_type: 'local', challenge_mode: 'normal' },
  { id: '5', title: 'Meal Prep Sundays', description: 'Prepare all meals for the upcoming week every Sunday evening.', category: 'fitness', creator_id: '2', creator_username: 'ryan', reward_xp: 180, participants_count: 6, duration_days: 30, created_at: new Date().toISOString(), challenge_type: 'friend', confirmation_method: 'photo_video', friend_id: '3', friend_username: 'nathanael', stake_description: 'Loser cooks for the winner for a week' },
  { id: '6', title: 'Gratitude Journal', description: 'Write down 3 things you are grateful for every night before bed.', category: 'social', creator_id: '3', creator_username: 'nathanael', reward_xp: 80, participants_count: 25, duration_days: 30, created_at: new Date().toISOString(), challenge_type: 'local', challenge_mode: 'normal' },
  { id: '7', title: 'Push-Up Challenge', description: 'Do 50 push-ups every day. Increase by 5 each week.', category: 'fitness', creator_id: '1', creator_username: 'yannick', reward_xp: 250, participants_count: 10, duration_days: 30, created_at: new Date().toISOString(), challenge_type: 'local', challenge_mode: 'daily' },
  { id: '8', title: 'Digital Detox Weekend', description: 'No screens from Friday 6pm to Monday 6am. Full disconnection.', category: 'social', creator_id: '2', creator_username: 'ryan', reward_xp: 300, participants_count: 5, duration_days: 4, created_at: new Date().toISOString(), challenge_type: 'friend', confirmation_method: 'location', friend_id: '1', friend_username: 'yannick', stake_description: 'Winner picks the next weekend activity', location_name: 'Central Park', target_lat: 40.7829, target_lng: -73.9654, target_radius_m: 500 },
];

export const MOCK_USER_CHALLENGES: UserChallenge[] = [
  { id: '1', user_id: 'self', challenge_id: '1', enrolled_at: new Date(Date.now() - 15 * 86400000).toISOString(), status: 'ACTIVE', progress: 50 },
  { id: '2', user_id: 'self', challenge_id: '3', enrolled_at: new Date(Date.now() - 10 * 86400000).toISOString(), status: 'ACTIVE', progress: 33 },
  { id: '3', user_id: 'self', challenge_id: '6', enrolled_at: new Date(Date.now() - 25 * 86400000).toISOString(), status: 'COMPLETED', progress: 100 },
  { id: '4', user_id: 'self', challenge_id: '4', enrolled_at: new Date(Date.now() - 5 * 86400000).toISOString(), status: 'FAILED', progress: 10 },
];

export const MOCK_FRIENDS: Friend[] = [
  {
    id: '1',
    username: 'yannick',
    total_xp: 2450,
    activeChallenges: [
      { title: '10k Morning Run', progress: 65, status: 'ACTIVE' },
      { title: 'Cold Shower Streak', progress: 100, status: 'COMPLETED' },
    ],
  },
  {
    id: '2',
    username: 'ryan',
    total_xp: 1820,
    activeChallenges: [
      { title: 'Read 20 Pages Daily', progress: 40, status: 'ACTIVE' },
      { title: 'Push-Up Challenge', progress: 22, status: 'ACTIVE' },
    ],
  },
  {
    id: '3',
    username: 'nathanael',
    total_xp: 3100,
    activeChallenges: [
      { title: 'Meal Prep Sundays', progress: 80, status: 'ACTIVE' },
      { title: 'Gratitude Journal', progress: 55, status: 'ACTIVE' },
      { title: 'Digital Detox Weekend', progress: 100, status: 'COMPLETED' },
    ],
  },
  {
    id: '4',
    username: 'alexandre',
    total_xp: 980,
    activeChallenges: [
      { title: 'No Social Media Before Noon', progress: 10, status: 'FAILED' },
    ],
  },
];

export const CATEGORY_COLORS: Record<string, string> = {
  fitness: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  social: 'bg-navy-500/10 text-navy-500 border-navy-500/20',
  productivity: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

export const FRIEND_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'text-teal-500',
  COMPLETED: 'text-emerald-500',
  FAILED: 'text-rose-500',
};
