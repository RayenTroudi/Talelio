"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/app/components/LocaleProvider";

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [commissionRate, setCommissionRate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [provisionLog, setProvisionLog] = useState<string[] | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      const data = await res.json();
      setCommissionRate(String(data.commissionRate));
    } catch {
      setError(t.admin.settings.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProvision = async () => {
    setProvisioning(true);
    setProvisionLog(null);
    try {
      const res = await fetch("/api/admin/settings/setup", { method: "POST" });
      const data = await res.json();
      setProvisionLog(data.log || []);
      await fetchSettings();
    } catch {
      setProvisionLog([t.admin.settings.setupError]);
    } finally {
      setProvisioning(false);
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess(false);

    const rate = parseFloat(commissionRate);
    if (!Number.isFinite(rate) || rate <= 0) {
      setError(t.admin.settings.saveError);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionRate: rate }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      const data = await res.json();
      setCommissionRate(String(data.commissionRate));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError(t.admin.settings.saveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.admin.settings.title}</h1>
        <p className="text-gray-500 mt-1">{t.admin.settings.subtitle}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900">{t.admin.settings.commissionTitle}</h2>
        <p className="text-sm text-gray-500 mt-1 mb-5">{t.admin.settings.commissionDesc}</p>

        {loading ? (
          <div className="text-sm text-gray-400">…</div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.admin.settings.commissionLabel}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full sm:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{t.admin.settings.saveSuccess}</p>}

            <Button onClick={handleSave} disabled={saving}>
              {saving ? t.admin.settings.saving : t.admin.settings.save}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900">{t.admin.settings.setupTitle}</h2>
        <p className="text-sm text-gray-500 mt-1 mb-5">{t.admin.settings.setupDesc}</p>

        <Button variant="outline" onClick={handleProvision} disabled={provisioning}>
          {provisioning ? t.admin.settings.setupRunning : t.admin.settings.setupButton}
        </Button>

        {provisionLog && (
          <ul className="mt-4 space-y-1 text-xs text-gray-500 font-mono">
            {provisionLog.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
