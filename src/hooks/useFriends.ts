import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Profile } from '../types';

export function useFriends() {
  const user = useAuthStore((s) => s.profile);
  const queryClient = useQueryClient();

  const friendsQuery = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: sent } = await supabase
        .from('friendships')
        .select('*, addressee:addressee_id(*)')
        .eq('requester_id', user.id)
        .eq('status', 'accepted');
      const { data: received } = await supabase
        .from('friendships')
        .select('*, requester:requester_id(*)')
        .eq('addressee_id', user.id)
        .eq('status', 'accepted');
      const friends = [
        ...((sent as any[])?.map((f) => f.addressee) ?? []),
        ...((received as any[])?.map((f) => f.requester) ?? []),
      ] as Profile[];
      return friends;
    },
    enabled: !!user,
  });

  const requestsQuery = useQuery({
    queryKey: ['friendRequests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('friendships')
        .select('*, requester:requester_id(*)')
        .eq('addressee_id', user.id)
        .eq('status', 'pending');
      return (data as any[])?.map((f) => f.requester as Profile) ?? [];
    },
    enabled: !!user,
  });

  const sendRequest = useMutation({
    mutationFn: async (username: string) => {
      if (!user) throw new Error('Not authenticated');
      const { data: target } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();
      if (!target) throw new Error('User not found');
      const { error } = await supabase.from('friendships').insert([
        { requester_id: user.id, addressee_id: target.id, status: 'pending' },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests', user?.id] });
    },
  });

  const acceptRequest = useMutation({
    mutationFn: async (requesterId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('requester_id', requesterId)
        .eq('addressee_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests', user?.id] });
    },
  });

  const declineRequest = useMutation({
    mutationFn: async (requesterId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('requester_id', requesterId)
        .eq('addressee_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests', user?.id] });
    },
  });

  const removeFriend = useMutation({
    mutationFn: async (friendId: string) => {
      if (!user) throw new Error('Not authenticated');
      await supabase
        .from('friendships')
        .delete()
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .or(`requester_id.eq.${friendId},addressee_id.eq.${friendId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
    },
  });

  return {
    friends: friendsQuery.data ?? [],
    requests: requestsQuery.data ?? [],
    isLoading: friendsQuery.isLoading,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
  };
}
