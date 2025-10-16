import { redirect } from "next/navigation";

export default function EditorPage({ params }: { params: { id: string } }) {
  // Redirect to flow section by default
  redirect(`/editor/${params.id}/flow`);
}
