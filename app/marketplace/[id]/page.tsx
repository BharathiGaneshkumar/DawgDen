export default function MarketplaceItemPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white">Marketplace Item — {params.id}</h1>
    </div>
  );
}
