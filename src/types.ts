export interface User {
  id: string;
  username: string;
  email: string;
  total_xp: number;
  bio?: string;
  full_name?: string;
  location?: string;
  interests?: string;
  avatar_url?: string;
}

export type ChallengeType = 'friend' | 'local';
export type ChallengeMode = 'daily' | 'normal';
export type ConfirmationMethod = 'photo_video' | 'location';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  creator_id: string;
  creator_username: string;
  reward_xp: number;
  participants_count: number;
  duration_days: number;
  created_at: string;
  start_time?: string;
  challenge_type?: ChallengeType;
  challenge_mode?: ChallengeMode;
  stake_description?: string;
  confirmation_method?: ConfirmationMethod;
  friend_id?: string;
  friend_username?: string;
  media_url?: string;
  wager_xp?: number;
  location_name?: string;
  target_lat?: number;
  target_lng?: number;
  target_radius_m?: number;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  enrolled_at: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  progress: number;
}

export interface CheckIn {
  id: string;
  user_challenge_id: string;
  challenge_id: string;
  challenge_title: string;
  user_id: string;
  username: string;
  imageUrl?: string;
  text_proof: string;
  message: string;
  media_url?: string;
  location_lat?: number;
  location_lng?: number;
  created_at: string;
  status: 'PENDING' | 'APPROVED' | 'DISPUTED' | 'VERIFIED';
}

export interface Verification {
  id: string;
  check_in_id: string;
  voter_id: string;
  voter_username: string;
  vote: 'APPROVE' | 'DISPUTED';
  created_at: string;
}

export interface SystemLog {
  id: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface LoginForm {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
}

export interface FriendProfile {
  id: string;
  username: string;
  total_xp: number;
}

export interface CreateFriendBetForm {
  title: string;
  description: string;
  stake_description: string;
  confirmation_method: ConfirmationMethod;
  friend_id: string;
  friend_username: string;
}

export interface CreateLocalBetForm {
  title: string;
  description: string;
  duration_days: number;
  wager_xp: number;
  media_url?: string;
}
