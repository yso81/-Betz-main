import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Challenge, UserChallenge, CheckIn, Verification, SystemLog, ChallengeType, ChallengeMode, ConfirmationMethod } from './types';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const usingSupabase = supabaseUrl.startsWith('https://') &&
  Boolean(supabaseKey) &&
  !supabaseKey.includes('<') &&
  !supabaseKey.includes('your-') &&
  !supabaseKey.includes('MY_');

const createEntityId = () => `mock-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;

class MockDatabaseEngine {
  private users: User[] = [];
  private challenges: Challenge[] = [];
  private userChallenges: (UserChallenge & { challenge?: Challenge })[] = [];
  private checkIns: CheckIn[] = [];
  private verifications: Verification[] = [];
  private logs: SystemLog[] = [];

  constructor() {
    console.warn('Using in-memory mock database engine because Supabase configuration is missing or invalid.');

    const defaultUser: User = {
      id: 'yc745fbf-4076-4767-8919-48227e7ca4b1',
      username: 'yannick',
      email: 'yannick@gmail.com',
      total_xp: 450
    };

    const secondaryUser: User = {
      id: 'ryan-01',
      username: 'ryan',
      email: 'ryan@gmail.com',
      total_xp: 330
    };

    const tertiaryUser: User = {
      id: 'nathanael-01',
      username: 'nathanael',
      email: 'nathanael@gmail.com',
      total_xp: 290
    };

    this.users = [defaultUser, secondaryUser, tertiaryUser];

    this.challenges = [{
      id: 'challenge-01',
      title: 'Daily Sprint Review',
      description: 'Write a short log at the end of every sprint to cement discipline.',
      category: 'Coding',
      creator_id: defaultUser.id,
      creator_username: defaultUser.username,
      reward_xp: 120,
      participants_count: 2,
      duration_days: 7,
      created_at: new Date().toISOString(),
      start_time: new Date(Date.now() - 3600000).toISOString()
    }];

    this.userChallenges = [{
      id: 'enroll-01',
      user_id: defaultUser.id,
      challenge_id: 'challenge-01',
      enrolled_at: new Date().toISOString(),
      status: 'ACTIVE',
      progress: 25,
      challenge: this.challenges[0]
    }, {
      id: 'enroll-02',
      user_id: secondaryUser.id,
      challenge_id: 'challenge-01',
      enrolled_at: new Date().toISOString(),
      status: 'ACTIVE',
      progress: 40,
      challenge: this.challenges[0]
    }];

    this.logs = [{
      id: 'log-01',
      action: 'SYSTEM',
      timestamp: new Date().toISOString(),
      details: 'Mock database engine initialized for local development.'
    }];
  }

  private findUser(predicate: (user: User) => boolean) {
    return this.users.find(predicate) || null;
  }

  private ensureUserExists(userId: string) {
    const user = this.findUser((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  private getChallengeById(challengeId: string) {
    const challenge = this.challenges.find((c) => c.id === challengeId);
    if (!challenge) throw new Error('Challenge not found');
    return challenge;
  }

  public async writeLog(action: string, details: string): Promise<void> {
    this.logs.unshift({
      id: createEntityId(),
      action,
      timestamp: new Date().toISOString(),
      details
    });
  }

  public async registerUser(
    username: string,
    email: string,
    passwordHash: string,
    bio?: string,
    fullName?: string,
    location?: string,
    interests?: string,
    avatarUrl?: string
  ): Promise<User> {
    const formattedUsername = username.toLowerCase().trim();
    const formattedEmail = email.toLowerCase().trim();

    const existing = this.users.find((user) => user.username === formattedUsername || user.email === formattedEmail);
    if (existing) {
      throw new Error('Username or email already registered');
    }

    const newUser: User = {
      id: createEntityId(),
      username: formattedUsername,
      email: formattedEmail,
      total_xp: 0,
      ...(bio ? { bio } : {}),
      ...(fullName ? { full_name: fullName } : {}),
      ...(location ? { location } : {}),
      ...(interests ? { interests } : {}),
      ...(avatarUrl ? { avatar_url: avatarUrl } : {})
    };

    this.users.push(newUser);
    await this.writeLog('User created', `@${newUser.username} (${newUser.email})`);
    return newUser;
  }

  public async loginUser(usernameOrEmail: string): Promise<User> {
    const searchStr = usernameOrEmail.toLowerCase().trim();
    const user = this.findUser((u) => u.username === searchStr || u.email === searchStr);
    if (!user) {
      throw new Error('User profile not found in transaction registry.');
    }
    await this.writeLog('User login', `@${user.username} successfully authenticated session.`);
    return user;
  }

  public async getFeed(): Promise<(CheckIn & { votes: Verification[] })[]> {
    return this.checkIns.map((checkIn) => ({
      ...checkIn,
      votes: this.verifications.filter((v) => v.check_in_id === checkIn.id)
    }));
  }

  public async getChallenges(): Promise<Challenge[]> {
    return this.challenges;
  }

  public async getChallengeCheckIns(challengeId: string): Promise<CheckIn[]> {
    return this.checkIns
      .filter((ci) => ci.challenge_id === challengeId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  public async createChallenge(
    title: string,
    description: string,
    category: string,
    reward_xp: number,
    duration_days: number,
    creatorId: string,
    creatorUsername: string,
    starts_in_hours: number = 1,
    challengeType: ChallengeType = 'friend',
    challengeMode: ChallengeMode = 'normal',
    stakeDescription?: string,
    confirmationMethod: ConfirmationMethod = 'photo_video',
    friendId?: string,
    friendUsername?: string,
    targetLat?: number,
    targetLng?: number,
    targetRadiusM?: number,
    locationName?: string,
    mediaUrl?: string,
  ): Promise<Challenge> {
    const startTimeDate = new Date(Date.now() + starts_in_hours * 3600 * 1000).toISOString();

    const challenge: Challenge = {
      id: createEntityId(),
      title,
      description,
      category,
      creator_id: creatorId,
      creator_username: creatorUsername,
      reward_xp,
      participants_count: 1,
      duration_days,
      created_at: new Date().toISOString(),
      start_time: startTimeDate,
      challenge_type: challengeType,
      challenge_mode: challengeMode,
      stake_description: stakeDescription,
      confirmation_method: confirmationMethod,
      friend_id: friendId,
      friend_username: friendUsername,
      target_lat: targetLat,
      target_lng: targetLng,
      target_radius_m: targetRadiusM,
      location_name: locationName,
      media_url: mediaUrl,
    };

    this.challenges.push(challenge);

    const enrollment = {
      id: createEntityId(),
      user_id: creatorId,
      challenge_id: challenge.id,
      enrolled_at: new Date().toISOString(),
      status: 'ACTIVE' as const,
      progress: 0,
      challenge
    };

    this.userChallenges.push(enrollment);
    await this.writeLog('Challenge created', `"${challenge.title}" (${challengeType}/${challengeMode}) launched by @${creatorUsername}. Earn ${challenge.reward_xp} XP!`);
    return challenge;
  }

  public async getLeaderboard(): Promise<User[]> {
    return [...this.users].sort((a, b) => b.total_xp - a.total_xp);
  }

  public async getSystemLogs(): Promise<SystemLog[]> {
    return [...this.logs].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 100);
  }

  public async getSystemState() {
    return {
      users: [...this.users],
      challenges: [...this.challenges],
      user_challenges: [...this.userChallenges],
      check_ins: [...this.checkIns],
      verifications: [...this.verifications]
    };
  }

  public async getUserEnrollments(userId: string): Promise<UserChallenge[]> {
    return this.userChallenges.filter((enrollment) => enrollment.user_id === userId);
  }

  public async joinChallenge(userId: string, username: string, challengeId: string): Promise<UserChallenge> {
    const existing = this.userChallenges.find((enrollment) => enrollment.user_id === userId && enrollment.challenge_id === challengeId);
    if (existing) {
      throw new Error('You are already locked into this challenge.');
    }

    const challenge = this.getChallengeById(challengeId);
    challenge.participants_count += 1;

    const enrollment = {
      id: createEntityId(),
      user_id: userId,
      challenge_id: challengeId,
      enrolled_at: new Date().toISOString(),
      status: 'ACTIVE' as const,
      progress: 0,
      challenge
    };

    this.userChallenges.push(enrollment);
    await this.writeLog('User enrolled', `@${username} joined the task group for "${challenge.title}".`);
    return enrollment;
  }

  public async submitCheckIn(
    userId: string,
    username: string,
    challengeId: string,
    text_proof: string,
    imageUrl?: string,
    locationLat?: number,
    locationLng?: number,
  ): Promise<CheckIn> {
    const challenge = this.getChallengeById(challengeId);
    const enrollment = this.userChallenges.find((uc) => uc.user_id === userId && uc.challenge_id === challengeId);
    if (!enrollment) throw new Error('You must join the challenge before checking in.');

    const checkIn: CheckIn = {
      id: createEntityId(),
      user_challenge_id: enrollment.id,
      challenge_id: challengeId,
      challenge_title: challenge.title,
      user_id: userId,
      username,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=60',
      text_proof,
      message: text_proof,
      media_url: imageUrl,
      location_lat: locationLat,
      location_lng: locationLng,
      created_at: new Date().toISOString(),
      status: 'PENDING'
    };

    this.checkIns.unshift(checkIn);

    const checkInCount = this.checkIns.filter(
      (ci) => ci.challenge_id === challengeId && ci.user_id === userId
    ).length;
    enrollment.progress = Math.min(
      100,
      Math.round((checkInCount / Math.max(1, challenge.duration_days)) * 100)
    );

    await this.writeLog('Check-in submitted', `@${username} submitted daily proof for "${challenge.title}": "${text_proof.slice(0, 40)}..."`);
    return checkIn;
  }

  public async verifyCheckIn(checkInId: string, verifierId: string, voteType: 'APPROVE' | 'DISPUTED') {
    const checkIn = this.checkIns.find((ci) => ci.id === checkInId);
    if (!checkIn) throw new Error('Target Check-In not found');
    if (checkIn.user_id === verifierId) throw new Error('Anti-Cheat Constraint: Forbidden from voting on your own check-ins!');

    const existingVote = this.verifications.find((v) => v.check_in_id === checkInId && v.voter_id === verifierId);
    if (existingVote) throw new Error('You have already casted a verification vote for this submission.');

    const verifier = this.ensureUserExists(verifierId);
    this.verifications.push({
      id: createEntityId(),
      check_in_id: checkInId,
      voter_id: verifierId,
      voter_username: verifier.username,
      vote: voteType,
      created_at: new Date().toISOString()
    });

    const approves = this.verifications.filter((v) => v.check_in_id === checkInId && v.vote === 'APPROVE').length;
    const disputes = this.verifications.filter((v) => v.check_in_id === checkInId && v.vote === 'DISPUTED').length;

    let targetStatus = checkIn.status;
    if (voteType === 'DISPUTED') {
      targetStatus = 'DISPUTED';
    } else if (approves > disputes) {
      targetStatus = 'VERIFIED';
    }

    checkIn.status = targetStatus;
    if (checkIn.status === 'VERIFIED') {
      const owner = this.ensureUserExists(checkIn.user_id);
      owner.total_xp += 50;
    }
    verifier.total_xp += 10;
    return { success: true, status: targetStatus };
  }

  public async clearLogs(): Promise<void> {
    this.logs = [];
    await this.writeLog('INFO', 'System ledger logs flushed clean.');
  }

  public async updateUserProfile(userId: string, profileUpdates: Partial<User>): Promise<User> {
    let user = this.findUser((u) => u.id === userId);
    if (!user) {
      // Re-create the user if missing after a server restart (mock database session restore)
      user = {
        id: userId,
        username: profileUpdates.username || 'restored_user',
        email: profileUpdates.email || 'restored@example.com',
        total_xp: profileUpdates.total_xp || 0
      };
      this.users.push(user);
    }
    const updatedUser: User = {
      ...user,
      ...profileUpdates,
      id: user.id
    };

    this.users = this.users.map((entry) => (entry.id === userId ? updatedUser : entry));
    await this.writeLog('Profile updated', `@${updatedUser.username} updated their account profile.`);
    return updatedUser;
  }

  public async getUserById(userId: string): Promise<User | null> {
    return this.findUser((user) => user.id === userId);
  }
}

class SupabaseEngine {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // System Log Writer
  public async writeLog(action: string, details: string): Promise<void> {
    await this.supabase
      .from('logs')
      .insert([{ action, details }]);
  }

  // User Registration Example
  public async registerUser(
    username: string,
    email: string,
    passwordHash: string,
    bio?: string,
    fullName?: string,
    location?: string,
    interests?: string,
    avatarUrl?: string
  ): Promise<User> {
    const formattedUsername = username.toLowerCase().trim();
    const formattedEmail = email.toLowerCase().trim();

    // Check Duplicate
    const { data: existingUser } = await this.supabase
      .from('users')
      .select('*')
      .or(`username.eq.${formattedUsername},email.eq.${formattedEmail}`)
      .maybeSingle();

    if (existingUser) {
      throw new Error('Username or email already registered');
    }

    // Insert User
    const { data: newUser, error } = await this.supabase
      .from('users')
      .insert([{
        username: formattedUsername,
        email: formattedEmail,
        password_hash: passwordHash,
        total_xp: 0,
        ...(bio ? { bio } : {}),
        ...(fullName ? { full_name: fullName } : {}),
        ...(location ? { location } : {}),
        ...(interests ? { interests } : {}),
        ...(avatarUrl ? { avatar_url: avatarUrl } : {})
      }])
      .select()
      .single();

    if (error) throw error;

    await this.writeLog('User created', `@${newUser.username} (${newUser.email})`);
    return newUser as User;
  }

  // Voting Loop Check-In Verification
  public async verifyCheckIn(checkInId: string, verifierId: string, voteType: 'APPROVE' | 'DISPUTED') {
    // 1. Fetch current Check-In status
    const { data: checkIn, error: ciError } = await this.supabase
      .from('check_ins')
      .select('*')
      .eq('id', checkInId)
      .single();

    if (ciError || !checkIn) throw new Error('Target Check-In not found');
    if (checkIn.user_id === verifierId) {
      throw new Error('Anti-Cheat Constraint: Forbidden from voting on your own check-ins!');
    }

    // 2. Cast Verification Vote
    const voter = await this.getUserById(verifierId);
    const { error: voteError } = await this.supabase
      .from('verifications')
      .insert([{ 
        check_in_id: checkInId, 
        voter_id: verifierId, 
        voter_username: voter?.username || 'unknown',
        vote: voteType 
      }]);

    if (voteError && voteError.code === '23505') { // Postgres Unique Constraint violation code
      throw new Error('You have already casted a verification vote for this submission.');
    }

    // 3. Count Votes
    const { data: votes } = await this.supabase
      .from('verifications')
      .select('vote')
      .eq('check_in_id', checkInId);

    const approves = votes?.filter(v => v.vote === 'APPROVE').length || 0;
    const disputes = votes?.filter(v => v.vote === 'DISPUTED').length || 0;

    let targetStatus = checkIn.status;
    if (voteType === 'DISPUTED') {
      targetStatus = 'DISPUTED';
    } else if (approves > disputes) {
      targetStatus = 'VERIFIED';
    }

    // Update Check-In Status
    await this.supabase.from('check_ins').update({ status: targetStatus }).eq('id', checkInId);

    // 4. Streak & XP Evaluation (Atomic update increments using RPC or safe query chains)
    let streakIncremented = false;
    let xpAward = 0;

    if (checkIn.status !== 'VERIFIED' && targetStatus === 'VERIFIED' && !checkIn.streak_awarded) {
      // Use RPC (Postgres Function) to atomically increment metrics or use manual execution:
      await this.supabase.rpc('increment_user_streak_and_xp', { 
        p_user_id: checkIn.user_id, 
        p_challenge_id: checkIn.challenge_id,
        p_check_in_id: checkInId
      });
      streakIncremented = true;
      xpAward = 50;
    }

    // Award helper participating XP to the verifier (+10 XP)
    await this.supabase.rpc('increment_verifier_xp', { p_verifier_id: verifierId });

    return { success: true, status: targetStatus, streak_incremented: streakIncremented, awarded_xp: xpAward };
  }

  // --- NEW CRUD METHODS FOR FULL MIGRATION ---

  public async loginUser(usernameOrEmail: string): Promise<User> {
    const searchStr = usernameOrEmail.toLowerCase().trim();
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .or(`username.eq.${searchStr},email.eq.${searchStr}`)
      .maybeSingle();

    if (error || !data) {
      throw new Error('User profile not found in transaction registry.');
    }
    await this.writeLog('User login', `@${data.username} successfully authenticated session.`);
    return data as User;
  }

  public async getFeed(): Promise<(CheckIn & { votes: Verification[] })[]> {
    const { data: checkIns, error: ciError } = await this.supabase
      .from('check_ins')
      .select('*')
      .order('created_at', { ascending: false });

    if (ciError) throw ciError;

    const { data: verifications, error: vError } = await this.supabase
      .from('verifications')
      .select('*');

    if (vError) throw vError;

    return checkIns.map(ci => ({
      ...ci,
      votes: verifications.filter(v => v.check_in_id === ci.id)
    }));
  }

  public async getChallenges(): Promise<Challenge[]> {
    const { data, error } = await this.supabase
      .from('challenges')
      .select('*');
    if (error) throw error;
    return data as Challenge[];
  }

  public async getChallengeCheckIns(challengeId: string): Promise<CheckIn[]> {
    const { data, error } = await this.supabase
      .from('check_ins')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as CheckIn[];
  }

  public async createChallenge(
    title: string,
    description: string,
    category: string,
    reward_xp: number,
    duration_days: number,
    creatorId: string,
    creatorUsername: string,
    starts_in_hours: number = 1,
    challengeType: ChallengeType = 'friend',
    challengeMode: ChallengeMode = 'normal',
    stakeDescription?: string,
    confirmationMethod: ConfirmationMethod = 'photo_video',
    friendId?: string,
    friendUsername?: string,
    targetLat?: number,
    targetLng?: number,
    targetRadiusM?: number,
    locationName?: string,
    mediaUrl?: string,
  ): Promise<Challenge> {
    const startTimeDate = new Date(Date.now() + starts_in_hours * 3600 * 1000).toISOString();

    const { data: challenge, error: chalError } = await this.supabase
      .from('challenges')
      .insert([{
        title,
        description,
        category,
        reward_xp,
        duration_days,
        creator_id: creatorId,
        creator_username: creatorUsername,
        start_time: startTimeDate,
        participants_count: 1,
        challenge_type: challengeType,
        challenge_mode: challengeMode,
        stake_description: stakeDescription,
        confirmation_method: confirmationMethod,
        friend_id: friendId,
        friend_username: friendUsername,
        target_lat: targetLat,
        target_lng: targetLng,
        target_radius_m: targetRadiusM,
        location_name: locationName,
        media_url: mediaUrl,
      }])
      .select()
      .single();

    if (chalError) throw chalError;

    const { error: enrollError } = await this.supabase
      .from('user_challenges')
      .insert([{
        user_id: creatorId,
        challenge_id: challenge.id,
        status: 'ACTIVE',
        progress: 0
      }]);

    if (enrollError) throw enrollError;

    await this.writeLog('Challenge created', `"${challenge.title}" (${challengeType}/${challengeMode}) launched by @${creatorUsername}. Earn ${challenge.reward_xp} XP!`);
    return challenge as Challenge;
  }

  public async joinChallenge(userId: string, username: string, challengeId: string): Promise<UserChallenge> {
    // Check if already enrolled
    const { data: existing } = await this.supabase
      .from('user_challenges')
      .select('id')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .maybeSingle();

    if (existing) {
      throw new Error('You are already locked into this challenge.');
    }

    const { data: enrollment, error } = await this.supabase
      .from('user_challenges')
      .insert([{
        user_id: userId,
        challenge_id: challengeId,
        status: 'ACTIVE',
        progress: 0
      }])
      .select()
      .single();

    if (error) throw error;

    // Increment participants_count
    const { data: chal } = await this.supabase.from('challenges').select('participants_count, title').eq('id', challengeId).single();
    if (chal) {
      await this.supabase.from('challenges').update({ participants_count: chal.participants_count + 1 }).eq('id', challengeId);
      await this.writeLog('User enrolled', `@${username} joined the task group for "${chal.title}".`);
    }

    return enrollment as UserChallenge;
  }

  public async getUserEnrollments(userId: string): Promise<UserChallenge[]> {
    const { data, error } = await this.supabase
      .from('user_challenges')
      .select('*, challenge:challenges(*)')
      .eq('user_id', userId);
      
    if (error) throw error;
    return data;
  }

  public async submitCheckIn(
    userId: string,
    username: string,
    challengeId: string,
    text_proof: string,
    imageUrl?: string,
    locationLat?: number,
    locationLng?: number,
  ): Promise<CheckIn> {
    const { data: chal } = await this.supabase.from('challenges').select('title').eq('id', challengeId).single();
    if (!chal) throw new Error('Challenge not found');

    const { data: uc } = await this.supabase
      .from('user_challenges')
      .select('id')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .maybeSingle();

    if (!uc) throw new Error('You must join the challenge before checking in.');

    const { data: checkIn, error } = await this.supabase
      .from('check_ins')
      .insert([{
        user_challenge_id: uc.id,
        challenge_id: challengeId,
        challenge_title: chal.title,
        user_id: userId,
        username: username,
        text_proof: text_proof,
        message: text_proof,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=60',
        media_url: imageUrl,
        location_lat: locationLat,
        location_lng: locationLng,
        status: 'PENDING'
      }])
      .select()
      .single();

    if (error) throw error;

    await this.writeLog('Check-in submitted', `@${username} submitted daily proof for "${chal.title}": "${text_proof.slice(0, 40)}..."`);
    return checkIn as CheckIn;
  }

  public async getLeaderboard(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .order('total_xp', { ascending: false });
    if (error) throw error;
    return data as User[];
  }

  public async getSystemLogs(): Promise<SystemLog[]> {
    const { data, error } = await this.supabase
      .from('logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
    if (error) throw error;
    return data as SystemLog[];
  }

  public async getSystemState() {
    const [users, challenges, user_challenges, check_ins, verifications] = await Promise.all([
      this.supabase.from('users').select('*').order('created_at', { ascending: true }),
      this.supabase.from('challenges').select('*').order('created_at', { ascending: true }),
      this.supabase.from('user_challenges').select('*').order('enrolled_at', { ascending: true }),
      this.supabase.from('check_ins').select('*').order('created_at', { ascending: true }),
      this.supabase.from('verifications').select('*').order('created_at', { ascending: true })
    ]);

    return {
      users: users.data || [],
      challenges: challenges.data || [],
      user_challenges: user_challenges.data || [],
      check_ins: check_ins.data || [],
      verifications: verifications.data || []
    };
  }

  public async clearLogs(): Promise<void> {
    await this.supabase.from('logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await this.writeLog('INFO', 'System ledger logs flushed clean.');
  }

  public async updateUserProfile(userId: string, profileUpdates: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update(profileUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) throw error || new Error('User profile not found');
    return data as User;
  }

  public async getUserById(userId: string): Promise<User | null> {
    const { data } = await this.supabase.from('users').select('*').eq('id', userId).maybeSingle();
    return data as User | null;
  }
}

export const dbEngine = usingSupabase ? new SupabaseEngine() : new MockDatabaseEngine();
