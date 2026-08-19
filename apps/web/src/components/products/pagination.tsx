import { Button } from "@Productlytics/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, total, limit, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="mt-6 flex items-center justify-center gap-4">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft data-icon="inline-start" />
        Prev
      </Button>
      <span className="text-xs text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
        <ChevronRight data-icon="inline-end" />
      </Button>
    </div>
  );
}
