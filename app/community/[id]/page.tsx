export default function PostDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold text-primary">Community Post — {params.id}</h1>
    </div>
  );
}
