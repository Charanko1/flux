"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  User as UserIcon,
  Save,
  Bell,
  Lock,
  CheckCircle2,
  XCircle,
  Camera,
  AlertTriangle,
} from "lucide-react";

/* --- 0. HELPER FUNCTION: COMPRESS IMAGE --- */
const resizeAndCompressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

/* --- 1. DEFINISI TIPE DATA UI --- */
interface UserData {
  username: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

interface SettingsCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  danger?: boolean;
  className?: string;
}

interface InputFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  icon?: React.ReactNode;
  fullWidthMobile?: boolean;
}

interface ToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/* --- 2. REUSABLE COMPONENTS (UI) --- */

function SettingsCard({
  icon,
  title,
  subtitle,
  children,
  danger = false,
  className = "",
}: SettingsCardProps) {
  return (
    <div
      className={`group h-full overflow-hidden rounded-xl border bg-white transition-all duration-300 hover:shadow-md ${
        danger ? "border-red-100 shadow-red-50/50" : "border-gray-200 shadow-sm"
      } ${className}`}
    >
      <div className="px-5 pt-5 pb-3 flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
            danger
              ? "bg-red-50 text-red-500 group-hover:bg-red-100"
              : "bg-amber-50 text-amber-500 group-hover:bg-amber-100"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0 pt-0.5">
          <h3
            className={`text-base sm:text-lg font-bold tracking-tight ${
              danger ? "text-red-900" : "text-gray-900"
            }`}
          >
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InputField({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
}: InputFieldProps) {
  return (
    <div className="w-full space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 ml-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          disabled={disabled}
          className={`block w-full rounded-lg border px-3 py-2.5 text-sm transition-all duration-200 outline-none
            ${
              disabled
                ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed"
                : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 hover:border-gray-300"
            }`}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function Button({
  children,
  variant = "primary",
  icon,
  className = "",
  fullWidthMobile = false,
  ...rest
}: ButtonProps) {
  const baseStyle =
    "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:pointer-events-none disabled:active:scale-100";
  const variants = {
    primary:
      "bg-amber-400 text-white shadow-sm shadow-amber-200 hover:bg-amber-500 hover:shadow-md hover:shadow-amber-200/50",
    secondary:
      "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300",
    danger:
      "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 hover:border-red-200",
  };
  const mobileWidthClass = fullWidthMobile ? "w-full sm:w-auto" : "";

  return (
    <button
      {...rest}
      className={`${baseStyle} ${variants[variant]} ${mobileWidthClass} ${className}`}
    >
      {icon && <span className="mr-2 -ml-0.5 opacity-90">{icon}</span>}
      {children}
    </button>
  );
}

function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3 group">
      <div className="flex flex-col pr-4">
        <span className="text-sm font-medium text-gray-900 group-hover:text-amber-600 transition-colors">
          {label}
        </span>
        <span className="text-xs text-gray-500 mt-0.5">{description}</span>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ${
          checked ? "bg-amber-400" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

/* --- 3. SECTIONS (LOGIC CONNECTED) --- */

const ProfileSection = ({
  user,
  handleUpdateApi,
  openModal,
}: {
  user: UserData;
  handleUpdateApi: any;
  openModal: () => void;
}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username ?? "");
      setEmail(user.email ?? "");
      setFullName(user.name ?? "");
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await handleUpdateApi({ username, name: fullName });
      setMessage({ type: "success", text: "Saved!" });
      window.location.reload();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const avatarText = (user?.name || "U").slice(0, 2).toUpperCase();

  return (
    <SettingsCard
      icon={<UserIcon size={20} />}
      title="Profile"
      subtitle="Personal details"
      // Classname grid dihapus disini karena akan dihandle parent wrapper untuk animasi
      className="h-full" 
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100 border-dashed">
          <div className="relative group cursor-pointer" onClick={openModal}>
            <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-50 ring-4 ring-white shadow-md transition-transform duration-300 group-hover:scale-105">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50 text-2xl font-bold text-amber-500">
                  {avatarText}
                </div>
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Camera className="text-white" size={24} />
            </div>
          </div>
          <div className="flex flex-col gap-2 text-center sm:text-left flex-1 w-full sm:w-auto">
            <div>
              <h4 className="text-lg font-bold text-gray-900">
                {fullName || "User"}
              </h4>
              <p className="text-sm text-gray-500">
                @{username || "username"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3">
              <Button variant="secondary" onClick={openModal} className="h-9">
                Change Photo
              </Button>
              <span className="text-xs text-gray-400">
                JPG, PNG (Max 2MB)
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <InputField
            label="Full Name"
            id="fullname"
            value={fullName}
            onChange={setFullName}
            placeholder="John Doe"
          />
          <InputField
            label="Username"
            id="username"
            value={username}
            onChange={setUsername}
            placeholder="johndoe"
          />
          <div className="sm:col-span-2">
            <InputField
              label="Email Address"
              id="email"
              type="email"
              value={email}
              onChange={setEmail}
              disabled
            />
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-2 gap-4 sm:gap-0">
          <div className="min-h-[24px] w-full sm:w-auto text-center sm:text-left">
            {message && (
              <span
                className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <XCircle size={16} />
                )}
                {message.text}
              </span>
            )}
          </div>
          <Button
            variant="primary"
            icon={<Save size={18} />}
            onClick={handleSave}
            disabled={saving}
            fullWidthMobile
            className="sm:min-w-[140px]"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </SettingsCard>
  );
};

const SecuritySection = ({ handleUpdateApi }: { handleUpdateApi: any }) => {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, val: string) =>
    setPasswords((prev) => ({ ...prev, [field]: val }));

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (passwords.new !== passwords.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (passwords.new.length < 6 && passwords.new.length > 0) {
      setError("Min 6 characters");
      return;
    }
    if (!passwords.current) {
      setError("Enter current password");
      return;
    }

    setSaving(true);
    try {
      await handleUpdateApi({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      setSuccess("Password updated successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsCard
      icon={<Lock size={20} />}
      title="Security"
      subtitle="Protection"
      className="h-full"
    >
      <div className="flex flex-col gap-4">
        <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100 text-blue-800 text-sm mb-1">
          <strong>Tip:</strong> Use a strong password with symbols.
        </div>
        <InputField
          label="Current Password"
          id="current_pass"
          type="password"
          value={passwords.current}
          onChange={(v) => handleChange("current", v)}
          placeholder="••••••••"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="New Password"
            id="new_pass"
            type="password"
            value={passwords.new}
            onChange={(v) => handleChange("new", v)}
            placeholder="••••••••"
          />
          <InputField
            label="Confirm Password"
            id="confirm_pass"
            type="password"
            value={passwords.confirm}
            onChange={(v) => handleChange("confirm", v)}
            placeholder="••••••••"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-2 bg-red-50 p-2 rounded-lg border border-red-100">
            <AlertTriangle size={16} /> {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600 flex items-center gap-2 bg-green-50 p-2 rounded-lg border border-green-100">
            <CheckCircle2 size={16} /> {success}
          </p>
        )}
        <div className="flex justify-end pt-2">
          <Button
            variant="secondary"
            onClick={handleSubmit}
            disabled={saving}
            fullWidthMobile
            className="border-amber-200 text-amber-700 hover:bg-amber-50"
          >
            {saving ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>
    </SettingsCard>
  );
};

const NotificationSection = () => {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    email: true,
    push: false,
    tasks: true,
    events: true,
  });
  const [saving, setSaving] = useState(false);
  const toggle = (key: string) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 800);
  };

  return (
    <SettingsCard
      icon={<Bell size={20} />}
      title="Notifications"
      subtitle="Alerts"
      className="h-full"
    >
      <div className="divide-y divide-gray-100 border rounded-xl border-gray-100 px-4">
        <Toggle
          label="Email Updates"
          description="Newsletters"
          checked={settings.email}
          onChange={() => toggle("email")}
        />
        <Toggle
          label="Push Alerts"
          description="Mobile push"
          checked={settings.push}
          onChange={() => toggle("push")}
        />
        <Toggle
          label="Tasks"
          description="Due reminders"
          checked={settings.tasks}
          onChange={() => toggle("tasks")}
        />
        <Toggle
          label="Events"
          description="Calendar"
          checked={settings.events}
          onChange={() => toggle("events")}
        />
      </div>
      <div className="mt-6">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          fullWidthMobile
          className="w-full"
        >
          {saving ? "Saving Preferences..." : "Save Preferences"}
        </Button>
      </div>
    </SettingsCard>
  );
};

/* --- 4. MAIN CONTENT (DENGAN ANIMASI) --- */

export default function SettingsPage() {
  const { user, updateUser: updateContextUser, loading } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LOGIC API UPDATE ---
  const handleUpdateApi = async (updates: any) => {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Gagal update profile");
    }

    await updateContextUser(updates);
    return data;
  };

  // --- MODAL & FILE LOGIC ---
  const openModal = () => {
    setFile(null);
    setPreview(null);
    setFileError(null);
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileError(null);
  };

  const validateAndSetFile = (f: File) => {
    const allowed = ["image/jpeg", "image/png", "image/gif"];
    if (!allowed.includes(f.type)) {
      setFileError("Format must be JPG, PNG, GIF");
      return false;
    }
    // Limit awal browser, nanti dikompres lagi
    if (f.size > 5 * 1024 * 1024) {
      setFileError("File too big. Max 5MB.");
      return false;
    }
    setFileError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    return true;
  };

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndSetFile(f);
  };

  // --- LOGIC SAVE PHOTO ---
  const handleSavePhoto = async () => {
    if (!file) return;
    setUploading(true);
    setFileError(null);

    try {
      const compressedBase64 = await resizeAndCompressImage(file);
      await handleUpdateApi({ avatarUrl: compressedBase64 });

      setUploading(false);
      closeModal();
      window.location.reload();
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploading(false);
      setFileError("Gagal upload. Cobalah gambar yang lebih kecil.");
    }
  };

  const safeUser: UserData = {
    username: user?.username || "",
    email: user?.email || "",
    name: user?.name || "",
    avatarUrl: user?.avatarUrl || null,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium animate-pulse">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10 sm:pb-20">
      {/* Inject Style Animasi Langsung Disini 
        Mendefinisikan keyframe fadeUpEnter dan class animate-enter
      */}
      <style jsx global>{`
        @keyframes fadeUpEnter {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-enter {
          opacity: 0; /* Mulai invisible */
          animation: fadeUpEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Header - Muncul langsung (delay 0ms) */}
        <div 
          className="mb-8 text-center sm:text-left animate-enter" 
          style={{ animationDelay: "0ms" }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Account Settings
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-500">
            Manage your profile details and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
          {/* Section 1: Profile (Wrapper mengambil jatah 3 kolom) - Delay 100ms */}
          <div 
            className="col-span-1 lg:col-span-3 animate-enter" 
            style={{ animationDelay: "100ms" }}
          >
            <ProfileSection
              user={safeUser}
              handleUpdateApi={handleUpdateApi}
              openModal={openModal}
            />
          </div>

          {/* Wrapper Section 2 & 3 */}
          <div className="contents lg:block lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Section 2: Security (2 kolom) - Delay 200ms */}
              <div 
                className="col-span-1 lg:col-span-2 animate-enter" 
                style={{ animationDelay: "200ms" }}
              >
                <SecuritySection handleUpdateApi={handleUpdateApi} />
              </div>
              
              {/* Section 3: Notification (1 kolom) - Delay 300ms */}
              <div 
                className="col-span-1 lg:col-span-1 h-full animate-enter" 
                style={{ animationDelay: "300ms" }}
              >
                <NotificationSection />
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Modal Upload */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-enter duration-300"
            onClick={closeModal}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all animate-enter"
              style={{ animationDuration: "0.4s" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Update Photo
                </h3>
                <button
                  onClick={closeModal}
                  className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                >
                  <XCircle size={24} className="text-gray-400" />
                </button>
              </div>

              <div
                className="relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-8 hover:bg-gray-50 hover:border-amber-300 transition-all cursor-pointer group"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files?.[0])
                    validateAndSetFile(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <div className="relative h-32 w-32 animate-enter">
                    <img
                      src={preview}
                      className="h-full w-full rounded-full object-cover border-4 border-white shadow-xl"
                      alt="Preview"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreview(null);
                        setFile(null);
                      }}
                      className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1.5 text-white shadow-md hover:bg-red-600 transition-transform hover:scale-110"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="rounded-full bg-amber-100 p-3 group-hover:scale-110 transition-transform duration-300">
                      <UserIcon size={32} className="text-amber-500" />
                    </div>
                    <div className="text-center px-4">
                      <p className="text-sm font-semibold text-gray-700">
                        Tap to upload
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        SVG, PNG, JPG or GIF (max. 5MB)
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={onFilePicked}
                    />
                  </>
                )}
              </div>

              {fileError && (
                <div className="mt-4 p-2 bg-red-50 text-red-600 rounded-lg text-sm text-center font-medium border border-red-100 animate-enter">
                  {fileError}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={closeModal}
                  fullWidthMobile
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSavePhoto}
                  disabled={uploading || !file}
                  fullWidthMobile
                  className="sm:w-28"
                >
                  {uploading ? "..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}