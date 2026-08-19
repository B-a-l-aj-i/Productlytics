import { Button } from "@Productlytics/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@Productlytics/ui/components/card";
import { Input } from "@Productlytics/ui/components/input";
import { Label } from "@Productlytics/ui/components/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { createProduct, type CreateProductInput } from "@/api/products";

const CATEGORIES = ["Battery", "Steel", "Textile"] as const;

export function CreateProduct({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [manufacturedOn, setManufacturedOn] = useState("");
  const [country, setCountry] = useState("");
  const [attributes, setAttributes] = useState<{ key: string; value: string }[]>([]);
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: () => {
      const data: CreateProductInput = {
        name,
        sku,
        category: (category || undefined) as CreateProductInput["category"],
        manufactured_on: manufacturedOn || undefined,
        country_of_origin: country || undefined,
        attributes: Object.fromEntries(
          attributes.filter((a) => a.key.trim()).map((a) => [a.key.trim(), a.value]),
        ),
      };
      return createProduct(data);
    },
    onSuccess: (product) => {
      toast.success(`${product.name} created`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onDone();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>New product</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" required value={sku} onChange={(e) => setSku(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">— none —</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="manufactured_on">Manufactured on</Label>
              <Input
                id="manufactured_on"
                type="date"
                value={manufacturedOn}
                onChange={(e) => setManufacturedOn(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="country">Country of origin (2 letters)</Label>
              <Input
                id="country"
                maxLength={2}
                placeholder="IN"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Attributes</Label>
            {attributes.map((attr, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="key (e.g. cell_chemistry)"
                  value={attr.key}
                  onChange={(e) =>
                    setAttributes((list) =>
                      list.map((a, j) => (j === i ? { ...a, key: e.target.value } : a)),
                    )
                  }
                />
                <Input
                  placeholder="value (e.g. LFP)"
                  value={attr.value}
                  onChange={(e) =>
                    setAttributes((list) =>
                      list.map((a, j) => (j === i ? { ...a, value: e.target.value } : a)),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setAttributes((list) => list.filter((_, j) => j !== i))}
                >
                  <X />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => setAttributes((list) => [...list, { key: "", value: "" }])}
            >
              <Plus data-icon="inline-start" />
              Add attribute
            </Button>
          </div>

          {create.isError && (
            <p className="text-sm text-destructive">{create.error.message}</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create"}
            </Button>
            <Button type="button" variant="ghost" onClick={onDone}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
