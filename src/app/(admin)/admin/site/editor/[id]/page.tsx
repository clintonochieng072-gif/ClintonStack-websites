"use client";

export default function AdminSiteEditorPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Site Editor - {params.id}</h1>
      <p className="text-gray-600">Site editing functionality coming soon...</p>
    </div>
  );
}
