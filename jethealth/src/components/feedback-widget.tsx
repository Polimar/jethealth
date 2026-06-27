"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function FeedbackWidget({ triageId }: { triageId: string | null }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (rating === 0) {
      toast.error("Seleziona una valutazione.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ triageId, rating, comment: comment || undefined }),
    });
    setLoading(false);
    if (res.ok) {
      setSent(true);
      toast.success("Grazie per il tuo feedback!");
    } else {
      toast.error("Invio non riuscito.");
    }
  }

  if (sent) {
    return (
      <p className="text-sm text-slate-600">Grazie per il tuo feedback! 🙏</p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">
        Questa indicazione ti è stata utile?
      </p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} stelle`}
          >
            <Star
              className={cn(
                "h-7 w-7 transition",
                (hover || rating) >= n
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-slate-300",
              )}
            />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Commento (opzionale)"
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button onClick={submit} disabled={loading} variant="outline" size="sm">
        {loading ? "Invio…" : "Invia feedback"}
      </Button>
    </div>
  );
}
