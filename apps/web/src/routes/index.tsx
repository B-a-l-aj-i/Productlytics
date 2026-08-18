import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="flex h-full items-center justify-center">
      <h1 className="text-4xl font-semibold">Productlytics</h1>
    </div>
  );
}
