// ============================================================
// STAGEY MOBILE — USER PROFILE (someone else)
// Loads a public profile by username, supports follow/unfollow
// and starting a direct message.
// ============================================================
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { ProfilesAPI, ConversationsAPI } from '../../services/api';
import { Screen, LoadingState, ErrorState } from '../../components/ui';
import ProfileDetailView from './ProfileDetailView';
import type { ProfileDetail } from '../../types';

export default function UserProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const username: string = route.params?.username;
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const q = useQuery({
    queryKey: ['profile', username],
    queryFn: () => ProfilesAPI.getByUsername(username),
    enabled: !!username,
  });

  const isOwn = !!user && q.data?.id === user.id;

  const followMutation = useMutation({
    mutationFn: () =>
      q.data?.isFollowing ? ProfilesAPI.unfollow(username) : ProfilesAPI.follow(username),
    onSuccess: (res) => {
      queryClient.setQueryData<ProfileDetail>(['profile', username], (prev) =>
        prev
          ? {
              ...prev,
              isFollowing: !prev.isFollowing,
              followerCount: res?.followers ?? prev.followerCount,
              followingCount: res?.following ?? prev.followingCount,
            }
          : prev,
      );
    },
    onError: () =>
      Toast.show({ type: 'error', text1: 'Could not update follow' }),
  });

  const messageMutation = useMutation({
    mutationFn: () => ConversationsAPI.start(username),
    onSuccess: (convo) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      navigation.navigate('Conversation', { conversationId: convo.id });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Could not start message' }),
  });

  const requireAuth = (fn: () => void) => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    fn();
  };

  if (q.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading profile…" />
      </Screen>
    );
  }
  if (q.isError || !q.data) {
    return (
      <Screen>
        <ErrorState message="This profile could not be loaded." onRetry={q.refetch} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ProfileDetailView
        profile={q.data}
        isOwn={isOwn}
        followLoading={followMutation.isPending}
        onFollowToggle={() => requireAuth(() => followMutation.mutate())}
        onMessage={() => requireAuth(() => messageMutation.mutate())}
        onEdit={() => navigation.navigate('EditProfile')}
      />
    </Screen>
  );
}
