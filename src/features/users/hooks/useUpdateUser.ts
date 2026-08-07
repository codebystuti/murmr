import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/features/auth/store';

export function useUpdateUser() {
  const qc = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; avatar?: string } }) =>
      usersApi.update(id, data),

    onMutate: async ({ data }) => {
      // Snapshot the current user BEFORE applying the optimistic patch
      const previousUser = useAuthStore.getState().user;
      updateUser(data);
      return { previousUser };
    },

    onError: (_err, _vars, context) => {
      // Restore the pre-mutation snapshot
      if (context?.previousUser) {
        updateUser(context.previousUser);
      }
      toast.error("Couldn't update profile. Try again.");
    },

    onSuccess: (updatedUser) => {
      updateUser({ name: updatedUser.name, avatar: updatedUser.avatar });
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Profile updated.');
    },
  });
}
