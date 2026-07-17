import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Challenge, UserChallenge, CheckIn, LoginForm, RegisterForm, ChallengeType, CreateFriendBetForm, CreateLocalBetForm } from './types';
import { User as UserIcon, Plus, Home, Users, TrendingUp, MoreVertical, CheckCircle2, XCircle, Clock, Flame } from 'lucide-react';
import AuthPage from './components/auth/AuthPage';
import LobbyPage from './portals/home/LobbyPage';
import FriendsPage from './portals/friends/FriendsPage';
import ProgressPage from './portals/progress/ProgressPage';
import ChallengeTypeSelector from './components/challenge/ChallengeTypeSelector';
import BetAgainstFriendWizard from './components/challenge/BetAgainstFriendWizard';
import LocalBetWizard from './components/challenge/LocalBetWizard';
import ChallengeDetailPage from './components/challenge/ChallengeDetailPage';
import EndChallengeModal from './components/challenge/EndChallengeModal';
import ChallengePreviewModal from './components/challenge/ChallengePreviewModal';
import Card from './components/ui/Card';
import SectionLabel from './components/ui/SectionLabel';
import NavButton from './components/ui/NavButton';
import Avatar from './components/ui/Avatar';
import StatCard from './components/ui/StatCard';

interface ProfileFormState {
  bio: string;
  fullName: string;
  location: string;
  interests: string;
  avatarUrl: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    username: string;
    email: string;
    total_xp: number;
    bio?: string;
    full_name?: string;
    location?: string;
    interests?: string;
    avatar_url?: string;
  } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);

  const [activeTab, setActiveTab] = useState(1);

  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showFriendWizard, setShowFriendWizard] = useState(false);
  const [showLocalWizard, setShowLocalWizard] = useState(false);
  const [endChallenge, setEndChallenge] = useState<Challenge | null>(null);

  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [challengeCheckIns, setChallengeCheckIns] = useState<CheckIn[]>([]);

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [challengeFilter, setChallengeFilter] = useState<'all' | 'ACTIVE' | 'COMPLETED' | 'FAILED'>('all');
  
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    bio: '',
    fullName: '',
    location: '',
    interests: '',
    avatarUrl: '',
  });
  
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileEditing, setProfileEditing] = useState(false);

  // Tracks whether the user has manually edited the profile form.
  // While dirty, background polling will NOT overwrite the form fields.
  const profileDirtyRef = useRef(false);

  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentUserIdRef.current = currentUser?.id || null;
  }, [currentUser?.id]);

  useEffect(() => {
    const savedUser = localStorage.getItem('betz_user');
    const savedToken = localStorage.getItem('betz_token');
    const explicitlyLoggedOut = localStorage.getItem('betz_logged_out') === 'true';

    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
        setToken(savedToken);
        setProfileForm({
          bio: parsedUser.bio || '',
          fullName: parsedUser.full_name || '',
          location: parsedUser.location || '',
          interests: parsedUser.interests || '',
          avatarUrl: parsedUser.avatar_url || '',
        });
      } catch {
        localStorage.removeItem('betz_user');
        localStorage.removeItem('betz_token');
      }
    } else if (!explicitlyLoggedOut) {
      setCurrentUser(null);
      setToken(null);
    }
  }, []);

  const fetchUserEnrollments = useCallback(async () => {
    const userId = currentUserIdRef.current;
    if (!userId) {
      setUserChallenges([]);
      return;
    }
    try {
      const res = await fetch(`/api/users/${userId}/challenges`);
      if (res.ok) {
        const data = await res.json();
        setUserChallenges(data);
      }
    } catch (e) {
      console.error('Error fetching user challenges', e);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const chalRes = await fetch('/api/challenges');
      if (chalRes.ok) {
        const chalData = await chalRes.json();
        setChallenges(chalData);
      }

      const stateRes = await fetch('/api/system/state');
      if (stateRes.ok) {
        const stateData = await stateRes.json();

        setCurrentUser(prevUser => {
          if (!prevUser) return null;
          const freshUser = stateData.users.find((u: { id: string }) => u.id === prevUser.id);
          if (freshUser) {
            const updated = {
              id: freshUser.id,
              username: freshUser.username,
              email: freshUser.email,
              total_xp: freshUser.total_xp,
              bio: freshUser.bio || '',
              full_name: freshUser.full_name || '',
              location: freshUser.location || '',
              interests: freshUser.interests || '',
              avatar_url: freshUser.avatar_url || ''
            };
            if (localStorage.getItem('betz_user')) {
              localStorage.setItem('betz_user', JSON.stringify(updated));
            }
            return updated;
          }
          return prevUser;
        });
      }

      if (currentUserIdRef.current) {
        await fetchUserEnrollments();
      }
    } catch (e) {
      console.error('Error polling background systems', e);
    }
  }, [fetchUserEnrollments]);

  useEffect(() => {
    // Only sync the form from currentUser when the user hasn't started
    // editing manually. This prevents the 3-second polling loop from
    // overwriting in-progress edits.
    if (currentUser && !profileDirtyRef.current) {
      setProfileForm({
        bio: currentUser.bio || '',
        fullName: currentUser.full_name || '',
        location: currentUser.location || '',
        interests: currentUser.interests || '',
        avatarUrl: currentUser.avatar_url || '',
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (endChallenge) return;
    const now = Date.now();
    for (const ch of challenges) {
      if (!ch.start_time) continue;
      const startTime = new Date(ch.start_time).getTime();
      const endTime = startTime + ch.duration_days * 86400000;
      if (now >= endTime) {
        const hasProof = localStorage.getItem(`betz_proof_${ch.id}`);
        if (!hasProof) {
          setEndChallenge(ch);
          break;
        }
      }
    }
  }, [challenges, endChallenge]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const parseJsonResponse = async (response: Response) => {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { error: 'The server returned an invalid response.' };
    }
  };

  const fetchChallengeCheckIns = useCallback(async (challengeId: string) => {
    try {
      const res = await fetch(`/api/challenges/${challengeId}/check-ins`);
      if (res.ok) {
        const data = await res.json();
        setChallengeCheckIns(data);
      }
    } catch (e) {
      console.error('Error fetching check-ins', e);
    }
  }, []);

  useEffect(() => {
    if (selectedChallengeId) {
      fetchChallengeCheckIns(selectedChallengeId);
    } else {
      setChallengeCheckIns([]);
    }
  }, [selectedChallengeId, fetchChallengeCheckIns]);

  const handleRegister = async (form: RegisterForm) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    localStorage.removeItem('betz_logged_out');
    setCurrentUser(data.user);
    setToken(data.token);
    localStorage.setItem('betz_user', JSON.stringify(data.user));
    localStorage.setItem('betz_token', data.token);
    fetchData();
  };

  const handleLogin = async (form: LoginForm) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    localStorage.removeItem('betz_logged_out');
    setCurrentUser(data.user);
    setToken(data.token);
    localStorage.setItem('betz_user', JSON.stringify(data.user));
    localStorage.setItem('betz_token', data.token);
    fetchData();
  };

  const handleLogout = () => {
    localStorage.setItem('betz_logged_out', 'true');
    setCurrentUser(null);
    setToken(null);
    setProfileForm({ bio: '', fullName: '', location: '', interests: '', avatarUrl: '' });
    setProfileMessage(null);
    localStorage.removeItem('betz_user');
    localStorage.removeItem('betz_token');
    setShowTypeSelector(false);
    setShowFriendWizard(false);
    setShowLocalWizard(false);
    setSelectedChallengeId(null);
  };

  const handleSaveProfile = async () => {
    if (!token || !currentUser) return;

    setProfileSaving(true);
    setProfileMessage(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          username: currentUser.username,
          email: currentUser.email,
          total_xp: currentUser.total_xp,
          bio: profileForm.bio.trim(),
          fullName: profileForm.fullName.trim(),
          location: profileForm.location.trim(),
          interests: profileForm.interests.trim(),
          avatarUrl: profileForm.avatarUrl.trim(),
        })
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data.error || 'Unable to save your profile.');

      // Build merged user, preferring what the server returned
      const updatedUser = {
        ...currentUser,
        ...(data.user || {}),
        bio: data.user?.bio ?? profileForm.bio.trim(),
        full_name: data.user?.full_name ?? profileForm.fullName.trim(),
        location: data.user?.location ?? profileForm.location.trim(),
        interests: data.user?.interests ?? profileForm.interests.trim(),
        avatar_url: data.user?.avatar_url ?? profileForm.avatarUrl.trim(),
      };
      // After a successful save, mark form as clean so polling can re-sync
      profileDirtyRef.current = false;
      setCurrentUser(updatedUser);
      localStorage.setItem('betz_user', JSON.stringify(updatedUser));
      setProfileMessage('Profile updated successfully.');
      setProfileEditing(false);
    } catch (err: unknown) {
      setProfileMessage(err instanceof Error ? err.message : 'Unable to save your profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancelEditProfile = () => {
    // Reset form back to current saved values and exit edit mode
    if (currentUser) {
      setProfileForm({
        bio: currentUser.bio || '',
        fullName: currentUser.full_name || '',
        location: currentUser.location || '',
        interests: currentUser.interests || '',
        avatarUrl: currentUser.avatar_url || '',
      });
    }
    profileDirtyRef.current = false;
    setProfileMessage(null);
    setProfileEditing(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    setProfileUploading(true);
    setProfileMessage(null);
    try {
      const formData = new FormData();
      formData.append('media', file);
      const res = await fetch('/api/upload/media', {
        method: 'POST',
        body: formData,
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data.error || 'Avatar upload failed.');

      // Flag the form as dirty so background polling does not wipe the newly uploaded avatar URL
      profileDirtyRef.current = true;
      setProfileForm((prev) => ({ ...prev, avatarUrl: data.url }));
      setProfileMessage('Avatar uploaded. Save your profile to keep it.');
    } catch (err: unknown) {
      setProfileMessage(err instanceof Error ? err.message : 'Avatar upload failed.');
    } finally {
      setProfileUploading(false);
      event.target.value = '';
    }
  };

  const handleTypeSelect = (type: ChallengeType) => {
    setShowTypeSelector(false);
    if (type === 'friend') setShowFriendWizard(true);
    else if (type === 'local') setShowLocalWizard(true);
  };

  const postChallenge = async (body: CreateFriendBetForm | CreateLocalBetForm) => {
    if (!token) return;
    const res = await fetch('/api/challenges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create challenge');
    }
    await fetchData();
    await fetchUserEnrollments();
  };

  const handleCreateFriendBet = async (form: CreateFriendBetForm) => {
    await postChallenge(form);
  };

  const handleCreateLocalBet = async (form: CreateLocalBetForm) => {
    await postChallenge({ ...form, category: 'fitness' } as CreateLocalBetForm);
  };

  const handleEndChallengeProof = async (message: string, mediaUrl?: string) => {
    if (!endChallenge) return;
    localStorage.setItem(`betz_proof_${endChallenge.id}`, JSON.stringify({ message, mediaUrl, submitted_at: new Date().toISOString() }));
    setEndChallenge(null);
    await fetchData();
  };

  const handleEndChallengeSkip = () => {
    if (endChallenge) {
      localStorage.setItem(`betz_proof_${endChallenge.id}`, 'skipped');
    }
    setEndChallenge(null);
  };

  const handleDailyCheckin = async (message: string, mediaUrl?: string, lat?: number, lng?: number) => {
    if (!selectedChallengeId || !token) return;
    const res = await fetch(`/api/challenges/${selectedChallengeId}/check-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        text_proof: message,
        message,
        media_url: mediaUrl,
        location_lat: lat,
        location_lng: lng,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit check-in');
    }
    await fetchChallengeCheckIns(selectedChallengeId);
    await fetchUserEnrollments();
  };

  const handleChallengeClick = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
  };

  const handleJoinChallenge = async (challengeId: string) => {
    const res = await fetch(`/api/challenges/${challengeId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to join challenge');
    }
    await fetchUserEnrollments();
  };

  const selectedChallenge = selectedChallengeId
    ? (challenges.find(c => c.id === selectedChallengeId) ?? null)
    : null;
  const selectedUserChallenge = selectedChallengeId
    ? userChallenges.find(uc => uc.challenge_id === selectedChallengeId)
    : null;

  const today = new Date().toDateString();
  const isCheckedInToday = challengeCheckIns.some(ci => {
    const ciDate = new Date(ci.created_at).toDateString();
    return ci.user_id === currentUser?.id && ciDate === today;
  });

  useEffect(() => {
    if (!showSettingsMenu) return;
    const handler = () => setShowSettingsMenu(false);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [showSettingsMenu]);

  return (
    <div
      className="min-h-screen font-sans antialiased flex flex-col justify-between text-slate-100"
      style={{
        backgroundImage: "linear-gradient(135deg, rgba(2,6,23,0.86), rgba(15,23,42,0.72)), url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >

      <main className="flex-1 w-full px-4 py-6 flex flex-col justify-center items-center">
        {!currentUser ? (
          <div className="w-full py-4 animate-fade-in">
            <AuthPage onLogin={handleLogin} onRegister={handleRegister} />
          </div>
        ) : (
          <div className="w-full animate-fade-in">
            {selectedChallengeId && selectedChallenge && selectedUserChallenge ? (
              <ChallengeDetailPage
                challenge={selectedChallenge}
                userChallenge={selectedUserChallenge}
                checkIns={challengeCheckIns}
                isCheckedInToday={isCheckedInToday}
                streakCount={challengeCheckIns.filter(ci => ci.user_id === currentUser?.id).length}
                onBack={() => setSelectedChallengeId(null)}
                onSubmitCheckin={handleDailyCheckin}
              />
            ) : (
              <>
                {activeTab === 1 && <LobbyPage challenges={challenges} onChallengeClick={handleChallengeClick} />}
                {activeTab === 2 && <FriendsPage />}
                {activeTab === 4 && (
                  <ProgressPage
                    userChallenges={userChallenges}
                    challenges={challenges}
                    onChallengeClick={handleChallengeClick}
                  />
                )}
                {activeTab === 5 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar username={currentUser.username} size="md" className="ring-2 ring-teal-400" />
                        <div>
                          <h2 className="text-xl font-bold text-slate-100">{currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1)}</h2>
                          <p className="text-sm text-slate-400">@{currentUser.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setShowSettingsMenu(false); handleLogout(); }}
                          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500/20"
                        >
                          Sign out
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-slate-400" />
                          </button>
                          {showSettingsMenu && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden">
                              <button
                                onClick={() => { setShowSettingsMenu(false); handleLogout(); }}
                                className="w-full px-4 py-3 text-left text-sm font-medium text-rose-400 hover:bg-slate-700 transition-colors"
                              >
                                Sign Out
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Card>
                      <div className="flex items-center justify-between">
                        <SectionLabel title="Profile" />
                        {!profileEditing && (
                          <button
                            onClick={() => { setProfileMessage(null); setProfileEditing(true); }}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-teal-500 hover:text-teal-400"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Edit Profile
                          </button>
                        )}
                      </div>

                      {/* ── Read-only view ── */}
                      {!profileEditing && (
                        <div className="mt-4 space-y-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <Avatar username={currentUser.username} size="md" className="ring-2 ring-teal-400 shrink-0" imageUrl={currentUser.avatar_url} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-100 truncate">{currentUser.full_name || currentUser.username}</p>
                              <p className="text-xs text-slate-100 truncate">{currentUser.email}</p>
                              {currentUser.location && (
                                <p className="text-xs text-slate-100 mt-0.5 truncate">{currentUser.location}</p>
                              )}
                            </div>
                          </div>
                          {currentUser.bio && (
                            <p className="text-sm text-slate-100 leading-relaxed break-words whitespace-pre-wrap">{currentUser.bio}</p>
                          )}
                          {currentUser.interests && (
                            <div className="flex flex-wrap gap-2">
                              {currentUser.interests.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                                <span key={tag} className="rounded-full bg-slate-700/80 px-2.5 py-0.5 text-xs font-medium text-slate-100">{tag}</span>
                              ))}
                            </div>
                          )}
                          {!currentUser.bio && !currentUser.interests && !currentUser.location && (
                            <p className="text-xs text-slate-400 italic">No profile info yet — click Edit Profile to add some.</p>
                          )}
                        </div>
                      )}

                      {/* ── Edit form ── */}
                      {profileEditing && (
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <Avatar username={currentUser.username} size="md" className="ring-2 ring-teal-400" imageUrl={profileForm.avatarUrl || currentUser.avatar_url} />
                            <label className="cursor-pointer rounded-xl border border-dashed border-slate-600 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-teal-500 hover:text-white">
                              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                              {profileUploading ? 'Uploading...' : 'Upload avatar'}
                            </label>
                          </div>
                          <div className="grid gap-3 grid-cols-2">
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                              <input
                                value={profileForm.fullName}
                                onChange={(e) => { profileDirtyRef.current = true; setProfileForm((prev) => ({ ...prev, fullName: e.target.value })); }}
                                placeholder="Full name"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                              <input
                                value={profileForm.location}
                                onChange={(e) => { profileDirtyRef.current = true; setProfileForm((prev) => ({ ...prev, location: e.target.value })); }}
                                placeholder="Location"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Interests</label>
                            <input
                              value={profileForm.interests}
                              onChange={(e) => { profileDirtyRef.current = true; setProfileForm((prev) => ({ ...prev, interests: e.target.value })); }}
                              placeholder="Interests (e.g. fitness, gaming, reading)"
                              className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Bio</label>
                            <textarea
                              value={profileForm.bio}
                              onChange={(e) => { profileDirtyRef.current = true; setProfileForm((prev) => ({ ...prev, bio: e.target.value })); }}
                              placeholder="Share a little about yourself and your goals..."
                              className="w-full min-h-24 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                          {profileMessage && (
                            <p className={`text-sm ${profileMessage.includes('successfully') || profileMessage.includes('uploaded') ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {profileMessage}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={handleCancelEditProfile}
                              disabled={profileSaving}
                              className="flex-1 rounded-xl border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-60"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveProfile}
                              disabled={profileSaving}
                              className="flex-1 rounded-xl bg-teal-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:opacity-60"
                            >
                              {profileSaving ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      )}
                    </Card>

                    <Card>
                      <SectionLabel title="Stats" />
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <StatCard label="XP" value={currentUser.total_xp} />
                        <StatCard label="Challenges" value={userChallenges.length} />
                      </div>
                    </Card>

                    <Card>
                      <SectionLabel title="All Challenges" />
                      <div className="mt-4 flex gap-2 mb-4">
                        {(['all', 'ACTIVE', 'COMPLETED', 'FAILED'] as const).map(filter => (
                          <button
                            key={filter}
                            onClick={() => setChallengeFilter(filter)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              challengeFilter === filter
                                ? 'bg-teal-500 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            {filter === 'all' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>

                      {(() => {
                        const filtered = userChallenges.filter(uc =>
                          challengeFilter === 'all' || uc.status === challengeFilter
                        );

                        if (filtered.length === 0) {
                          return (
                            <p className="text-sm text-slate-400 text-center py-6">
                              No challenges found.
                            </p>
                          );
                        }

                        return (
                          <div className="space-y-3">
                            {filtered.map(uc => {
                              const ch = challenges.find(c => c.id === uc.challenge_id);
                              if (!ch) return null;

                              const statusConfig: Record<'ACTIVE' | 'COMPLETED' | 'FAILED', { icon: React.ComponentType<any>; color: string; bg: string }> = {
                                ACTIVE: { icon: Flame, color: 'text-blue-400', bg: 'bg-blue-500/20' },
                                COMPLETED: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
                                FAILED: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/20' },
                              };
                              const cfg = statusConfig[uc.status as 'ACTIVE' | 'COMPLETED' | 'FAILED'];
                              const StatusIcon = cfg.icon;

                              const categoryColors: Record<string, string> = {
                                fitness: 'bg-emerald-500/20 text-emerald-300',
                                productivity: 'bg-blue-500/20 text-blue-300',
                                social: 'bg-purple-500/20 text-purple-300',
                              };

                              return (
                                <div key={uc.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
                                  <div className={`p-2 rounded-lg ${cfg.bg}`}>
                                    <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-medium text-slate-200 truncate">{ch.title}</p>
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${categoryColors[ch.category] || 'bg-slate-600 text-slate-300'}`}>
                                        {ch.category}
                                      </span>
                                    </div>
                                    <div className="mt-1.5">
                                      <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-teal-400 rounded-full transition-all duration-300"
                                          style={{ width: `${uc.progress}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-xs text-slate-400 font-medium shrink-0">{uc.progress}%</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <ChallengeTypeSelector
          isOpen={showTypeSelector}
          onSelect={handleTypeSelect}
          onClose={() => setShowTypeSelector(false)}
        />

        <BetAgainstFriendWizard
          isOpen={showFriendWizard}
          onClose={() => setShowFriendWizard(false)}
          onSubmit={handleCreateFriendBet}
        />

        <LocalBetWizard
          isOpen={showLocalWizard}
          onClose={() => setShowLocalWizard(false)}
          onSubmit={handleCreateLocalBet}
          currentXP={currentUser?.total_xp || 0}
        />

        <EndChallengeModal
          isOpen={!!endChallenge}
          challenge={endChallenge}
          onClose={handleEndChallengeSkip}
          onSubmit={handleEndChallengeProof}
        />

        <ChallengePreviewModal
          isOpen={!!selectedChallengeId && !!selectedChallenge && !selectedUserChallenge}
          challenge={selectedChallenge}
          onClose={() => setSelectedChallengeId(null)}
          onJoin={handleJoinChallenge}
        />

      </main>

      {currentUser && (
        <nav className="sticky bottom-0 z-40 bg-slate-900 border-t border-slate-800 px-2 py-2 flex items-center justify-around">
          <NavButton icon={Home} label="Home" isActive={activeTab === 1 && !selectedChallengeId} onClick={() => { setActiveTab(1); setSelectedChallengeId(null); }} />
          <NavButton icon={Users} label="Friends" isActive={activeTab === 2 && !selectedChallengeId} onClick={() => { setActiveTab(2); setSelectedChallengeId(null); }} />
          <NavButton icon={Plus} label="Add" isActive={false} onClick={() => currentUser && setShowTypeSelector(true)} large />
          <NavButton icon={TrendingUp} label="Progress" isActive={activeTab === 4 && !selectedChallengeId} onClick={() => { setActiveTab(4); setSelectedChallengeId(null); }} />
          <NavButton icon={UserIcon} label="Profile" isActive={activeTab === 5 && !selectedChallengeId} onClick={() => { setActiveTab(5); setSelectedChallengeId(null); }} />
        </nav>
      )}

    </div>
  );
}