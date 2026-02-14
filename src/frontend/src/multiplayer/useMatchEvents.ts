import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';

export function useMatchEvents(lobbyId: bigint | null) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const submitAction = useMutation({
    mutationFn: async (action: string) => {
      if (!actor || !lobbyId) throw new Error('Actor or lobby not available');
      return actor.submitAction(lobbyId, action);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchActions', lobbyId?.toString()] });
    },
  });

  const { data: actions, isLoading: actionsLoading } = useQuery({
    queryKey: ['matchActions', lobbyId?.toString()],
    queryFn: async () => {
      if (!actor || !lobbyId) return [];
      return actor.getMatchActions(lobbyId);
    },
    enabled: !!actor && !!lobbyId,
    refetchInterval: 500, // Poll every 500ms for actions
  });

  const { data: match, isLoading: matchLoading } = useQuery({
    queryKey: ['match', lobbyId?.toString()],
    queryFn: async () => {
      if (!actor || !lobbyId) return null;
      return actor.getMatch(lobbyId);
    },
    enabled: !!actor && !!lobbyId,
    refetchInterval: 1000,
  });

  return {
    submitAction,
    actions: actions || [],
    actionsLoading,
    match,
    matchLoading,
  };
}
