import { Button } from "@Productlytics/ui/components/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteProduct } from "@/api/products";

export function DeleteProduct({
  id,
  name,
  onDeleted,
}: {
  id: number;
  name: string;
  onDeleted?: () => void;
}) {
  const queryClient = useQueryClient();

  const remove = useMutation({
    mutationFn: () => deleteProduct(id),
    onSuccess: () => {
      toast.success(`${name} deleted`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onDeleted?.();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`Delete ${name}`}
      disabled={remove.isPending}
      onClick={() => {
        if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
          remove.mutate();
        }
      }}
    >
      <Trash2 className="text-destructive" />
    </Button>
  );
}
