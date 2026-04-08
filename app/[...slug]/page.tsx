import { redirect } from "next/navigation";

type CatchAllPageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  await params;
  redirect("/");
}