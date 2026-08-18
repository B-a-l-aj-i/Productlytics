import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold leading-tight">
        Digital Product Passports for
        <br />
        <span className="text-blue-500">Trust and Traceability</span>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground">
        Record what your products are made of, publish public passports, and
        prove origin to regulators and buyers.
      </p>
    </div>
  );
}
