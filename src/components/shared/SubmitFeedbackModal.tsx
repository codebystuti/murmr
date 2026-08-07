import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ChevronRight, ChevronLeft, Check, Loader2, LayoutList } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useBoards } from '@/features/boards/hooks/useBoards';
import { useCreatePost } from '@/features/posts/hooks/usePostMutations';
import { useAuth } from '@/hooks/useAuth';
import type { Board } from '@/types';

const schema = z.object({
  title: z.string().min(10, 'Must be at least 10 characters').max(150, 'Too long'),
  body: z.string().max(2000, 'Too long').optional().default(''),
  boardId: z.string().min(1, 'Select a board'),
  tags: z.string().optional().default(''),
});
type FormData = z.infer<typeof schema>;

interface SubmitFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultBoardId?: string;
}

const STEP_LABELS = ['Details', 'Category', 'Review'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
      {STEP_LABELS.map((label, idx) => {
        const step = idx + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  background: done || active
                    ? 'linear-gradient(135deg, var(--grad-1), var(--grad-2))'
                    : 'var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: done || active ? 'var(--text-on-gradient)' : 'var(--tx3)',
                  transition: 'all var(--dur-medium)',
                  flexShrink: 0,
                }}
              >
                {done ? <Check size={11} /> : step}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--tx)' : 'var(--tx3)',
                  transition: 'color var(--dur-medium)',
                }}
              >
                {label}
              </span>
            </div>
            {idx < STEP_LABELS.length - 1 && (
              <div
                style={{
                  width: 24,
                  height: 1,
                  background: done ? 'linear-gradient(90deg, var(--grad-1), var(--grad-2))' : 'var(--border)',
                  transition: 'background var(--dur-medium)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function fieldStyle(hasError = false): React.CSSProperties {
  return {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 8,
    border: `1px solid ${hasError ? 'var(--status-error)' : 'var(--border)'}`,
    background: 'var(--bg)',
    color: 'var(--tx)',
    fontSize: 14,
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color var(--dur-ui), box-shadow var(--dur-ui)',
    boxSizing: 'border-box' as const,
  };
}

function focusStyle(e: React.FocusEvent<HTMLElement>) {
  (e.target as HTMLElement).style.borderColor = 'var(--grad-1)';
  (e.target as HTMLElement).style.boxShadow =
    '0 0 0 3px color-mix(in oklab, var(--grad-1) 20%, transparent)';
}
function blurStyle(hasError: boolean) {
  return (e: React.FocusEvent<HTMLElement>) => {
    (e.target as HTMLElement).style.borderColor = hasError ? 'var(--status-error)' : 'var(--border)';
    (e.target as HTMLElement).style.boxShadow = 'none';
  };
}

export function SubmitFeedbackModal({
  open,
  onOpenChange,
  defaultBoardId,
}: SubmitFeedbackModalProps) {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const { data: boards = [] } = useBoards();
  const { mutate: createPost, isPending } = useCreatePost();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      body: '',
      boardId: defaultBoardId ?? boards[0]?.id ?? '',
      tags: '',
    },
    mode: 'onTouched',
  });

  // Seed boardId default once boards load
  const boardId = form.watch('boardId');
  if (!boardId && boards.length > 0) {
    form.setValue('boardId', defaultBoardId ?? boards[0].id);
  }

  function handleClose() {
    onOpenChange(false);
    // Reset after close animation (~200ms)
    setTimeout(() => {
      form.reset();
      setStep(1);
    }, 200);
  }

  async function nextStep() {
    if (step === 1) {
      const ok = await form.trigger(['title', 'body']);
      if (ok) setStep(2);
    } else if (step === 2) {
      const ok = await form.trigger(['boardId']);
      if (ok) setStep(3);
    }
  }

  function prevStep() {
    setStep((s) => Math.max(1, s - 1));
  }

  function onSubmit(data: FormData) {
    if (!user) return;
    const tags = (data.tags ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    createPost(
      { title: data.title, body: data.body ?? '', boardId: data.boardId, authorId: user.id, tags },
      {
        onSuccess: () => {
          toast.success('Feedback submitted!');
          handleClose();
        },
      },
    );
  }

  const values = form.watch();
  const selectedBoard = boards.find((b) => b.id === values.boardId);

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(8,7,13,0.6)',
            backdropFilter: 'blur(6px)',
            zIndex: 40,
          }}
        />
        <Dialog.Content
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
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px 24px 16px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
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
                Submit feedback
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close"
                  className="bg-transparent text-[var(--tx3)] hover:bg-[var(--elev)] hover:text-[var(--tx)] focus-ring"
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
            <StepIndicator current={step} />
          </div>

          {/* Body */}
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div style={{ padding: '20px 24px', minHeight: 240 }}>
              {/* Step 1: Title + Description */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: 'var(--tx2)',
                        marginBottom: 6,
                      }}
                    >
                      Title <span style={{ color: 'var(--status-error)' }}>*</span>
                    </label>
                    <input
                      {...form.register('title')}
                      autoFocus
                      placeholder="Short, clear summary of your feedback"
                      style={fieldStyle(!!form.formState.errors.title)}
                      onFocus={focusStyle}
                      onBlur={blurStyle(!!form.formState.errors.title)}
                    />
                    {form.formState.errors.title && (
                      <p style={{ fontSize: 11, color: 'var(--status-error)', marginTop: 4 }}>
                        {form.formState.errors.title.message}
                      </p>
                    )}
                    <p
                      style={{
                        fontSize: 11,
                        color: 'var(--tx3)',
                        marginTop: 4,
                        textAlign: 'right',
                      }}
                    >
                      {values.title?.length ?? 0}/150
                    </p>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: 'var(--tx2)',
                        marginBottom: 6,
                      }}
                    >
                      Description
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 400,
                          color: 'var(--tx3)',
                          marginLeft: 6,
                        }}
                      >
                        optional
                      </span>
                    </label>
                    <textarea
                      {...form.register('body')}
                      rows={5}
                      placeholder="More context helps your team prioritise and understand the request…"
                      style={{ ...fieldStyle(!!form.formState.errors.body), resize: 'vertical', lineHeight: 1.6 }}
                      onFocus={focusStyle}
                      onBlur={blurStyle(!!form.formState.errors.body)}
                    />
                    {form.formState.errors.body && (
                      <p style={{ fontSize: 11, color: 'var(--status-error)', marginTop: 4 }}>
                        {form.formState.errors.body.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Board + Tags */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: 'var(--tx2)',
                        marginBottom: 8,
                      }}
                    >
                      Board <span style={{ color: 'var(--status-error)' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {boards.map((board: Board) => {
                        const selected = form.watch('boardId') === board.id;
                        return (
                          <button
                            key={board.id}
                            type="button"
                            onClick={() => form.setValue('boardId', board.id, { shouldValidate: true })}
                            className="focus-ring"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '12px 16px',
                              borderRadius: 10,
                              border: selected
                                ? '1px solid color-mix(in oklab, var(--grad-1) 40%, transparent)'
                                : '1px solid var(--border)',
                              background: selected
                                ? 'color-mix(in oklab, var(--grad-1) 8%, transparent)'
                                : 'var(--bg)',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all var(--dur-ui)',
                              width: '100%',
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: selected
                                  ? 'linear-gradient(135deg, var(--grad-1), var(--grad-2))'
                                  : 'var(--elev)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'background var(--dur-ui)',
                              }}
                            >
                              <LayoutList
                                size={14}
                                style={{ color: selected ? 'var(--text-on-gradient)' : 'var(--tx3)' }}
                              />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: selected ? 'var(--tx)' : 'var(--tx)',
                                  marginBottom: 2,
                                }}
                              >
                                {board.name}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--tx3)' }}>
                                {board.description}
                              </div>
                            </div>
                            {selected && (
                              <div
                                style={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: 999,
                                  background: 'linear-gradient(135deg, var(--grad-1), var(--grad-2))',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <Check size={9} color="var(--text-on-gradient)" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {form.formState.errors.boardId && (
                      <p style={{ fontSize: 11, color: 'var(--status-error)', marginTop: 6 }}>
                        {form.formState.errors.boardId.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
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
                        comma-separated · optional
                      </span>
                    </label>
                    <input
                      {...form.register('tags')}
                      placeholder="api, integration, auth"
                      style={{ ...fieldStyle(), fontFamily: 'var(--font-mono)', fontSize: 13 }}
                      onFocus={focusStyle}
                      onBlur={blurStyle(false)}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--tx2)',
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    Review your feedback before submitting.
                  </p>

                  <div
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: 'var(--tx3)',
                          margin: '0 0 4px',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        Title
                      </p>
                      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx)', margin: 0 }}>
                        {values.title}
                      </p>
                    </div>

                    {values.body && (
                      <div>
                        <p
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--tx3)',
                            margin: '0 0 4px',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          Description
                        </p>
                        <p
                          style={{
                            fontSize: 13,
                            color: 'var(--tx2)',
                            margin: 0,
                            lineHeight: 1.6,
                          }}
                        >
                          {values.body}
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      {selectedBoard && (
                        <div>
                          <p
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: 'var(--tx3)',
                              margin: '0 0 4px',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            Board
                          </p>
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: 'var(--tx)',
                              margin: 0,
                            }}
                          >
                            {selectedBoard.name}
                          </p>
                        </div>
                      )}

                      {values.tags && (
                        <div>
                          <p
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: 'var(--tx3)',
                              margin: '0 0 4px',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            Tags
                          </p>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {values.tags
                              .split(',')
                              .map((t) => t.trim())
                              .filter(Boolean)
                              .map((tag) => (
                                <span
                                  key={tag}
                                  style={{
                                    fontSize: 11,
                                    fontFamily: 'var(--font-mono)',
                                    padding: '2px 7px',
                                    borderRadius: 999,
                                    border: '1px solid var(--border)',
                                    color: 'var(--tx3)',
                                  }}
                                >
                                  #{tag}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 8,
                padding: '16px 24px',
                borderTop: '1px solid var(--border)',
              }}
            >
              <div>
                {step > 1 && (
                  <Button type="button" variant="default" size="sm" onClick={prevStep}>
                    <ChevronLeft size={14} />
                    Back
                  </Button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Button type="button" variant="default" size="sm" onClick={handleClose}>
                  Cancel
                </Button>

                {step < 3 ? (
                  <Button type="button" variant="primary" size="sm" onClick={nextStep}>
                    Next
                    <ChevronRight size={14} />
                  </Button>
                ) : (
                  <Button type="submit" variant="primary" size="sm" disabled={isPending}>
                    {isPending && <Loader2 size={13} className="animate-spin" />}
                    {isPending ? 'Submitting…' : 'Submit feedback'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
