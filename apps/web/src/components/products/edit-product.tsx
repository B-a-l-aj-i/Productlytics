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

import {
  updateProduct,
  type ProductResponse,
  type UpdateProductInput,
} from "@/api/products";

const CATEGORIES = ["Battery", "Steel", "Textile"] as const;

export function EditProduct({
  product,
  onDone,
}: {
  product: ProductResponse;
  onDone: () => void;
}) {
  const [name, setName] = useState(product.name);
  const [sku, setSku] = useState(product.sku);
  const [category, setCategory] = useState(product.category ?? "");
  const [manufacturedOn, setManufacturedOn] = useState(product.manufacturedOn ?? "");
  const [country, setCountry] = useState(product.countryOfOrigin ?? "");
  const [status, setStatus] = useState<"draft" | "published">(product.status);
  const [attributes, setAttributes] = useState<{ key: string; value: string }[]>(
    Object.entries(product.attributes).map(([key, value]) => ({ key, value })),
  );
  const queryClient = useQueryClient();

  const update = useMutation({
    mutationFn: () => {
      const data: UpdateProductInput = {
        name,
        sku,
        category: category === "" ? null : (category as "Battery" | "Steel" | "Textile"),
        manufactured_on: manufacturedOn === "" ? null : manufacturedOn,
        country_of_origin: country === "" ? null : country,
        status,
        attributes: Object.fromEntries(
          attributes.filter((a) => a.key.trim()).map((a) => [a.key.trim(), a.value]),
        ),
      };
      return updateProduct(product.id, data);
    },
    onSuccess: (updated) => {
      toast.success(`${updated.name} saved`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onDone();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit product</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            update.mutate();
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-sku">SKU *</Label>
              <Input
                id="edit-sku"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <select
                id="edit-category"
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
              <Label htmlFor="edit-manufactured">Manufactured on</Label>
              <Input
                id="edit-manufactured"
                type="date"
                value={manufacturedOn}
                onChange={(e) => setManufacturedOn(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-country">Country of origin (2 letters)</Label>
              <Input
                id="edit-country"
                maxLength={2}
                placeholder="IN"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Attributes</Label>
            {attributes.map((attr, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="key"
                  value={attr.key}
                  onChange={(e) =>
                    setAttributes((list) =>
                      list.map((a, j) => (j === i ? { ...a, key: e.target.value } : a)),
                    )
                  }
                />
                <Input
                  placeholder="value"
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

          {update.isError && (
            <p className="text-sm text-destructive">{update.error.message}</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? "Saving…" : "Save"}
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
