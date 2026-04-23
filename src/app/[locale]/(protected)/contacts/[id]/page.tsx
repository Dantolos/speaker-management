import { notFound, redirect } from "next/navigation";
import { getInternalSession } from "@/utils/auth";
import {
  getContact,
  getContactContributions,
} from "@/services/speaker/contacts";
import ContactDetailView from "@/component/Pages/Contacts/ContactDetailView";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ContactDetailPage({ params }: Props) {
  const { id } = await params;

  const session = await getInternalSession();
  if (!session.isAuthenticated) {
    redirect(`/sign-in?redirect=/contacts/${id}&type=team`);
  }

  const [contact, contributions] = await Promise.all([
    getContact(id),
    getContactContributions(id),
  ]);

  if (!contact) notFound();

  return (
    <ContactDetailView
      contact={contact}
      contributions={contributions}
      variant="page"
    />
  );
}
