import type { User } from '@/types';

export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

export function isOwner(user: User | null, authorId: string): boolean {
  return user?.id === authorId;
}

export function canEdit(user: User | null, authorId: string): boolean {
  return isOwner(user, authorId) || isAdmin(user);
}

export function canDelete(user: User | null, authorId: string): boolean {
  return isOwner(user, authorId) || isAdmin(user);
}

export function canChangeStatus(user: User | null): boolean {
  return isAdmin(user);
}

export function canEditComment(user: User | null, authorId: string): boolean {
  return isOwner(user, authorId);
}

export function canDeleteComment(user: User | null, authorId: string): boolean {
  return isOwner(user, authorId) || isAdmin(user);
}
