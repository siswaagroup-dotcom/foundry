import { clients } from "@/components/clients/data/clients-data";
import { ClientDetailWorkspace } from "../../../../../clients/client-detail/ClientDetailWorkspace";

type ClientDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const { id } = await params;
  const client = clients.find((item) => item.id === id) ?? clients[0];

  return <ClientDetailWorkspace client={client} />;
}
