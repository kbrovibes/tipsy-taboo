import Watch from "@/components/Watch";

export default async function WatchPage({ params }: PageProps<"/watch/[code]">) {
  const { code } = await params;
  return <Watch code={code.toUpperCase()} />;
}
