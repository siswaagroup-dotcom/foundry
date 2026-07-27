"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useCreateClient } from "@/hooks/useClients";

type FormData = {
  clientName:  string;
  companyName: string;
  timezone:    string;
  contactName: string;
  email:       string;
  phone:       string;
  details:     string;
};

const initialForm: FormData = {
  clientName: "", companyName: "", timezone: "Pacific Time (PT)",
  contactName: "", email: "", phone: "", details: "",
};

const timezones = [
  "Pacific Time (PT)", "Mountain Time (MT)",
  "Central Time (CT)", "Eastern Time (ET)",
];

export function CreateClientWorkspace({ onCancel }: { onCancel?: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const createMutation = useCreateClient();

  const [formData, setFormData] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => ({
    clientName: submitted && !formData.clientName.trim(),
    email: submitted && formData.email.trim() !== "" && !/^\S+@\S+\.\S+$/.test(formData.email),
  }), [formData.clientName, formData.email, submitted]);

  function update(field: keyof FormData, value: string) {
    setFormData((c) => ({ ...c, [field]: value }));
  }

  async function saveClient() {
    setSubmitted(true);
    if (!formData.clientName.trim()) return;
    if (formData.email.trim() && !/^\S+@\S+\.\S+$/.test(formData.email)) return;

    try {
      await createMutation.mutateAsync({
        name:         formData.clientName.trim(),
        companyName:  formData.companyName.trim()  || undefined,
        timezone:     formData.timezone            || undefined,
        email:        formData.email.trim()        || undefined,
        phone:        formData.phone.trim()        || undefined,
        notes:        formData.details.trim()      || undefined,
        contactName:  formData.contactName.trim()  || undefined,
      });
      toast({ title: "Client created", variant: "success" });
      router.push("/dashboard/clients");
    } catch (err) {
      toast({
        title: "Failed to create client",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "error",
      });
    }
  }

  function cancel() {
    if (onCancel) onCancel();
    else router.push("/dashboard/clients");
  }

  const inputClass =
    "h-10 w-full rounded border border-[#e5e7eb] px-3 text-xs outline-none focus:border-[#f15a24] focus:ring-2 focus:ring-[#f15a24]/10";
  const isPending = createMutation.isPending;

  return (
    <div className="min-h-full bg-[#f5f7fb]">
      <div className="sticky top-0 z-10 flex h-[72px] items-center justify-between gap-3 border-b border-[#edf0f3] bg-white px-6">
        <nav className="flex items-center gap-2 text-xs text-[#6b7280]">
          <Link href="/dashboard/clients" className="text-primary hover:underline transition-colors">
            Clients
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#111827]">Create Client</span>
        </nav>
        <div className="flex gap-3">
          <button
            onClick={cancel}
            disabled={isPending}
            className="inline-flex h-10 items-center gap-2 rounded border border-[#e5e7eb] px-5 text-xs text-[#64748b] disabled:opacity-50"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            onClick={saveClient}
            disabled={isPending}
            className="inline-flex h-10 items-center gap-2 rounded bg-[#f15a24] px-5 text-xs font-bold text-white shadow-[0_8px_18px_rgba(241,90,36,0.28)] disabled:opacity-60"
          >
            <Check className="h-3 w-3" />
            {isPending ? "Saving…" : "Save Client"}
          </button>
        </div>
      </div>

      <p className="mx-auto max-w-[680px] px-4 py-3 text-[11px] text-[#64748b]">
        Add a new client to manage projects, track time, and streamline collaboration
      </p>

      <form
        className="mx-auto max-w-[680px] rounded-xl bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
        onSubmit={(e) => { e.preventDefault(); saveClient(); }}
      >
        {/* Basic Information */}
        <h2 className="text-sm font-bold">Basic Information</h2>
        <div className="mt-4 border-t border-[#edf0f3] pt-4">
          <label className="text-[11px] font-bold">Client Name *</label>
          <input
            value={formData.clientName}
            onChange={(e) => update("clientName", e.target.value)}
            placeholder="Enter client name"
            className={`${inputClass} mt-2 ${errors.clientName ? "border-red-400" : ""}`}
          />
          {errors.clientName && (
            <p className="mt-1 text-[11px] text-red-500">Client name is required.</p>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-bold">Company Name</label>
              <input
                value={formData.companyName}
                onChange={(e) => update("companyName", e.target.value)}
                placeholder="Company or organization"
                className={`${inputClass} mt-2`}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold">Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => update("timezone", e.target.value)}
                className={`${inputClass} mt-2`}
              >
                {timezones.map((tz) => <option key={tz}>{tz}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <h2 className="mt-8 text-sm font-bold">Contact Information</h2>
        <div className="mt-4 border-t border-[#edf0f3] pt-4">
          <label className="text-[11px] font-bold">Primary Contact Name</label>
          <input
            value={formData.contactName}
            onChange={(e) => update("contactName", e.target.value)}
            placeholder="Contact person name"
            className={`${inputClass} mt-2`}
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-bold">Email Address</label>
              <input
                value={formData.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="email@example.com"
                className={`${inputClass} mt-2 ${errors.email ? "border-red-400" : ""}`}
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-red-500">Enter a valid email address.</p>
              )}
            </div>
            <div>
              <label className="text-[11px] font-bold">Phone Number</label>
              <input
                value={formData.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
                className={`${inputClass} mt-2`}
              />
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <h2 className="mt-8 text-sm font-bold">Additional Details</h2>
        <textarea
          value={formData.details}
          onChange={(e) => update("details", e.target.value)}
          placeholder="Notes about this client…"
          className={`${inputClass} mt-4 min-h-24 py-3`}
        />
      </form>
    </div>
  );
}
