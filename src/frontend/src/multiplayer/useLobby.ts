import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import type { Lobby } from '@/backend';

export function useLobby() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const createLobby = useMutation({
    mutationFn: async (maxPlayers: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createLobby(BigInt(maxPlayers));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lobbies'] });
    },
  });

  const joinLobby = useMutation({
    mutationFn: async (lobbyId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.joinLobby(lobbyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lobbies'] });
    },
  });

  const leaveLobby = useMutation({
    mutationFn: async (lobbyId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.leaveLobby(lobbyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lobbies'] });
    },
  });

  const startMatch = useMutation({
    mutationFn: async (lobbyId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.startMatch(lobbyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lobbies'] });
    },
  });

  const { data: waitingLobbies, isLoading: lobbiesLoading } = useQuery({
    queryKey: ['lobbies', 'waiting'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWaitingLobbies();
    },
    enabled: !!actor,
    refetchInterval: 2000, // Poll every 2 seconds
  });

  return {
    createLobby,
    joinLobby,
    leaveLobby,
    startMatch,
    waitingLobbies,
    lobbiesLoading,
  };
}

// Separate hook for getting a specific lobby
export function useGetLobby(lobbyId: bigint | null) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ['lobby', lobbyId?.toString()],
    queryFn: async () => {
      if (!actor || !lobbyId) return null;
      return actor.getLobby(lobbyId);
    },
    enabled: !!actor && !!lobbyId,
    refetchInterval: 1000, // Poll every second
  });
}
