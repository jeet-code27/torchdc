export default function OrdersPlaceholderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Orders
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Delivery and Pickup order management (scheduled for Step 8).
        </p>
      </div>

      <div className="flex gap-2 border-b border-border pb-3">
        <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground">
          Delivery Orders
        </button>
        <button className="px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:bg-muted">
          Store Pickup
        </button>
      </div>

      <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card/50">
        <p className="text-sm text-muted-foreground">
          Order management with Delivery | Pickup flows will be built in Step 8.
        </p>
      </div>
    </div>
  );
}
