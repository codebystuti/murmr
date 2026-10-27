import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useId, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUpdatePost } from '@/features/posts/hooks/usePostMutations';
import type { Post } from '@/types';

const schema = z.object({
  title: z.string().min(10, 'Must be at least 10 characters').max(150, 'Too long'),
  body: z.string().max(2000, 'Too long'),
  tags: z.string(),
});
type FormData = z.infer<typeof schema>;

interface EditPostModalProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPostModal({ post, open, onOpenChange }: EditPostModalProps) {
  const { mutate: updatePost, isPending } = useUpdatePost();

  const uid = useId();
  const ids = {
    title: `${uid}-title`,
    titleError: `${uid}-title-error`,
    body: `${uid}-body`,
    bodyError: `${uid}-body-error`,
    tags: `${uid}-tags`,
  };

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post.title,
      body: post.body,
      tags: post.tags.join(', '),
    },
    // Validate on blur, then re-validate on change so errors clear as soon as they're fixed.
    mode: 'onTouched',
  });

  // Load the latest post into the form only when the modal opens. Resetting on every
  // `post` change would wipe unsaved edits whenever a background refetch lands.
  const wasOpen = useRef(open);
  useEffect(() => {
    if (open && !wasOpen.current) {
      form.reset({
        title: post.title,
        body: post.body,
        tags: post.tags.join(', '),
      });
    }
    wasOpen.current = open;
  }, [open, post, form]);

  function onSubmit(data: FormData) {
    const tags = data.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    updatePost(
      { id: post.id, title: data.title, body: data.body, tags },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="murmr-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(8,7,13,0.6)',
            backdropFilter: 'blur(6px)',
            zIndex: 40,
          }}
        />
        <Dialog.Content
          className="murmr-dialog"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(560px, 94vw)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            boxShadow: '0 30px 80px -10px rgba(0,0,0,0.5), 0 0 0 1px var(--border-2)',
            zIndex: 50,
            outline: 'none',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px 0',
            }}
          >
            <Dialog.Title
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--tx)',
                letterSpacing: '-0.01em',
                margin: 0,
              }}
            >
              Edit post
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Update this post&apos;s title, description and tags.
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close dialog"
                className="bg-transparent text-[var(--tx3)] hover:bg-[var(--elev)] hover:text-[var(--tx)] focus-ring hit-44"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--dur-ui)',
                }}
              >
                <X size={14} />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Title */}
              <div>
                <label
                  htmlFor={ids.title}
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--tx2)',
                    marginBottom: 6,
                  }}
                >
                  Title
                </label>
                <input
                  {...form.register('title')}
                  id={ids.title}
                  aria-invalid={!!form.formState.errors.title}
                  aria-describedby={form.formState.errors.title ? ids.titleError : undefined}
                  className={`input-field${form.formState.errors.title ? ' input-error' : ''}`}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--tx)',
                    fontSize: 14,
                    fontFamily: 'var(--font-body)',
                    transition: 'border-color var(--dur-ui), box-shadow var(--dur-ui)',
                    boxSizing: 'border-box',
                  }}
                />
                {form.formState.errors.title && (
                  <p id={ids.titleError} style={{ fontSize: 11, color: 'var(--status-error)', marginTop: 4 }}>
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              {/* Body */}
              <div>
                <label
                  htmlFor={ids.body}
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--tx2)',
                    marginBottom: 6,
                  }}
                >
                  Description
                </label>
                <textarea
                  {...form.register('body')}
                  id={ids.body}
                  aria-invalid={!!form.formState.errors.body}
                  aria-describedby={form.formState.errors.body ? ids.bodyError : undefined}
                  rows={5}
                  className={`input-field${form.formState.errors.body ? ' input-error' : ''}`}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--tx)',
                    fontSize: 14,
                    fontFamily: 'var(--font-body)',
                    resize: 'vertical',
                    lineHeight: 1.6,
                    transition: 'border-color var(--dur-ui), box-shadow var(--dur-ui)',
                    boxSizing: 'border-box',
                  }}
                />
                {form.formState.errors.body && (
                  <p id={ids.bodyError} style={{ fontSize: 11, color: 'var(--status-error)', marginTop: 4 }}>
                    {form.formState.errors.body.message}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label
                  htmlFor={ids.tags}
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--tx2)',
                    marginBottom: 6,
                  }}
                >
                  Tags
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 400,
                      color: 'var(--tx3)',
                      marginLeft: 6,
                    }}
                  >
                    comma-separated
                  </span>
                </label>
                <input
                  {...form.register('tags')}
                  id={ids.tags}
                  placeholder="api, integration, auth"
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--tx)',
                    fontSize: 13,
                    fontFamily: 'var(--font-mono)',
                    transition: 'border-color var(--dur-ui), box-shadow var(--dur-ui)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                padding: '16px 24px',
                borderTop: '1px solid var(--border)',
              }}
            >
              <Dialog.Close asChild>
                <Button type="button" variant="default" size="sm">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" variant="primary" size="sm" disabled={isPending}>
                {isPending && <Loader2 size={13} className="animate-spin" />}
                {isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
