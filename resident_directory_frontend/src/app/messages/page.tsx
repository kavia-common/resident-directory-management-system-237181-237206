"use client";

/**
 * Messages page – inbox and sent messages with compose functionality.
 */
import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { messagesApi, adminApi, MessageOut, AdminUserOut } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import AlertMessage from "@/components/ui/AlertMessage";
import Badge from "@/components/ui/Badge";

type Tab = "inbox" | "sent";

export default function MessagesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("inbox");
  const [messages, setMessages] = useState<MessageOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data =
        tab === "inbox" ? await messagesApi.inbox() : await messagesApi.sent();
      setMessages(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleDelete = async (id: number) => {
    try {
      await messagesApi.delete(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Messages"
        subtitle="Your direct messages"
        action={
          <Button onClick={() => setComposeOpen(true)} variant="primary" size="sm">
            + Compose
          </Button>
        }
      />

      {error && (
        <div className="mb-4">
          <AlertMessage type="error" message={error} onClose={() => setError("")} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 mb-6 border-b-4 border-retro-dark">
        {(["inbox", "sent"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`font-mono text-xs font-bold uppercase tracking-widest px-6 py-2 border-r-2 border-retro-dark transition-colors ${
              tab === t
                ? "bg-retro-dark text-retro-green"
                : "bg-retro-cream text-retro-muted hover:bg-retro-dark/10"
            }`}
          >
            {t === "inbox" ? "✉ Inbox" : "✈ Sent"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : messages.length === 0 ? (
        <div className="border-4 border-retro-dark bg-retro-cream p-8 text-center shadow-[4px_4px_0_#000]">
          <div className="font-mono text-4xl mb-3">📭</div>
          <p className="font-mono text-sm text-retro-muted uppercase tracking-widest">
            No messages in {tab}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className="border-4 border-retro-dark bg-retro-cream p-4 shadow-[3px_3px_0_#000] flex items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-xs text-retro-muted">
                    {tab === "inbox"
                      ? `From: User #${m.sender_id}`
                      : `To: User #${m.recipient_id}`}
                  </span>
                  {!m.is_read && tab === "inbox" && (
                    <Badge variant="green">New</Badge>
                  )}
                </div>
                {m.subject && (
                  <div className="font-mono font-bold text-retro-dark text-sm">
                    {m.subject}
                  </div>
                )}
                <p className="font-mono text-sm text-retro-dark mt-1 line-clamp-2">
                  {m.body}
                </p>
                <div className="font-mono text-xs text-retro-muted mt-2">
                  {new Date(m.created_at).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => handleDelete(m.id)}
                className="font-mono text-xs text-retro-red hover:underline flex-shrink-0"
                aria-label="Delete message"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Compose modal */}
      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        currentUserId={user?.id}
        onSent={() => {
          setComposeOpen(false);
          if (tab === "sent") fetchMessages();
        }}
      />
    </AppShell>
  );
}

function ComposeModal({
  open,
  onClose,
  currentUserId,
  onSent,
}: {
  open: boolean;
  onClose: () => void;
  currentUserId?: number;
  onSent: () => void;
}) {
  const [users, setUsers] = useState<AdminUserOut[]>([]);
  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      adminApi.listUsers().then(setUsers).catch(() => setUsers([]));
    }
  }, [open]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId || !body.trim()) {
      setError("Recipient and message body are required.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await messagesApi.send({
        recipient_id: Number(recipientId),
        subject: subject || null,
        body: body.trim(),
      });
      setRecipientId("");
      setSubject("");
      setBody("");
      onSent();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const eligibleUsers = users.filter((u) => u.id !== currentUserId);

  return (
    <Modal open={open} onClose={onClose} title="Compose Message">
      <form onSubmit={handleSend} className="space-y-4">
        {error && <AlertMessage type="error" message={error} onClose={() => setError("")} />}
        <div>
          <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
            To
          </label>
          <select
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            required
            className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green"
          >
            <option value="">Select recipient...</option>
            {eligibleUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username} ({u.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
            Subject (optional)
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Re: ..."
            className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green"
          />
        </div>
        <div>
          <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
            Message
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={4}
            placeholder="Type your message..."
            className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green resize-none"
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={sending}>
            ✈ Send
          </Button>
        </div>
      </form>
    </Modal>
  );
}
