import { Button } from "@Productlytics/ui/components/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

import { documentUrl, listDocuments, uploadDocument } from "@/api/documents";

export function ProductDocuments({ productId }: { productId: number }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const docs = useQuery({
    queryKey: ["documents", productId],
    queryFn: () => listDocuments(productId),
  });

  const upload = useMutation({
    mutationFn: (file: File) => uploadDocument(productId, file),
    onSuccess: (doc) => {
      toast.success(`${doc.originalFilename} uploaded`);
      queryClient.invalidateQueries({ queryKey: ["documents", productId] });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="mt-2 flex flex-col gap-2 border-t pt-3">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Documents</p>
        <input
          ref={fileInput}
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload.mutate(file);
            e.target.value = ""; // same file re-selectable
          }}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={upload.isPending}
          onClick={() => fileInput.current?.click()}
        >
          <Upload data-icon="inline-start" />
          {upload.isPending ? "Uploading…" : "Upload"}
        </Button>
      </div>

      {docs.data?.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No documents. PDF, PNG or JPG, max 5 MB.
        </p>
      )}
      {docs.data?.map((doc) => (
        <a
          key={doc.id}
          href={documentUrl(doc.id)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm hover:underline"
        >
          <FileText className="size-4 text-muted-foreground" />
          <span className="truncate">{doc.originalFilename}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {(doc.sizeBytes / 1024).toFixed(0)} KB
          </span>
        </a>
      ))}
    </div>
  );
}
