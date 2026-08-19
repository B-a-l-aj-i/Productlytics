import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@Productlytics/ui/components/card";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";

import { documentUrl } from "@/api/documents";
import { getPassport } from "@/api/passport";

export const Route = createFileRoute("/p/$publicId")({
  component: PassportPage,
});

function PassportPage() {
  const { publicId } = Route.useParams();

  const passport = useQuery({
    queryKey: ["passport", publicId],
    queryFn: () => getPassport(publicId),
    retry: false, // a dead link stays dead — no point retrying 404s
  });

  if (passport.isPending) {
    return <p className="mx-auto max-w-2xl px-4 py-10 text-sm">Loading…</p>;
  }

  if (passport.isError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <h1 className="text-xl font-semibold">Passport not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This link is invalid.
        </p>
      </div>
    );
  }

  const p = passport.data;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{p.name}</CardTitle>
          <CardDescription>Digital Product Passport · {p.sku}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <Row label="Category" value={p.category ?? "—"} />
          <Row label="Country of origin" value={p.countryOfOrigin ?? "—"} />
          <Row label="Manufactured on" value={p.manufacturedOn ?? "—"} />
          {Object.entries(p.attributes).map(([key, value]) => (
            <Row key={key} label={key} value={value} />
          ))}

          {p.documents.length > 0 && (
            <div className="mt-2 flex flex-col gap-1 border-t pt-3">
              <p className="text-muted-foreground">Documents</p>
              {p.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={documentUrl(doc.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:underline"
                >
                  <FileText className="size-4 text-muted-foreground" />
                  {doc.originalFilename}
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
