"use client";

import React, { useEffect, useRef, useState, createContext, useContext } from "react";
import { 
  User as UserIcon, 
  Save, 
  Bell, 
  Lock, 
  Trash2, 
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react";

/* --- 1. DEFINISI TIPE DATA (TYPES) --- */
interface UserData {
  username: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

interface AuthContextType {
  user: UserData;
  updateUser: (updates: Partial<UserData>) => Promise<UserData>;
}

interface SettingsCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  danger?: boolean;
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

/* --- MOCK CONTEXT --- */
// Kita definisikan context bisa null di awal
const AuthContext = createContext<AuthContextType | null>(null);

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData>({
    username: "johndoe",
    email: "john.doe@example.com",
    name: "John Doe",
    avatarUrl: null
  });

  const updateUser = async (updates: Partial<UserData>) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setUser((prev) => ({ ...prev, ...updates }));
    return { ...user, ...updates };
  };

  return (
    <AuthContext.Provider value={{ user, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Fallback mock jika provider lupa dipasang
    return { 
      user: { username: "guest", email: "guest@example.com", name: "Guest", avatarUrl: null }, 
      updateUser: async () => ({ username: "guest", email: "guest", name: "Guest", avatarUrl: null }) 
    };
  }
  return context;
};

/* --- REUSABLE COMPONENTS --- */

function SettingsCard({ icon, title, subtitle, children, danger = false }: SettingsCardProps) {
  return (
    <div className={`overflow-hidden rounded-xl border bg-white shadow-sm ${danger ? 'border-red-200' : 'border-gray-200'}`}>
      <div className={`border-b px-4 py-3 sm:px-6 sm:py-4 flex items-start gap-3 sm:gap-4 ${danger ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
        <div className={`rounded-lg p-2 shrink-0 ${danger ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className={`text-base sm:text-lg font-semibold truncate ${danger ? 'text-red-900' : 'text-gray-900'}`}>{title}</h3>
          <p className={`text-xs sm:text-sm ${danger ? 'text-red-700' : 'text-gray-500'}`}>{subtitle}</p>
        </div>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

function InputField({ label, id, type = "text", value, onChange, placeholder, disabled = false }: InputFieldProps) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div>
        <input
          id={id}
          name={id}
          type={type}
          disabled={disabled}
          className={`block w-full rounded-lg border px-3 py-2.5 sm:py-2 text-sm shadow-sm focus:outline-none transition-all duration-200 ${
            disabled 
              ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500" 
              : "border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          }`}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function Button({ children, variant = "primary", icon, className = "", fullWidthMobile = false, ...rest }: ButtonProps) {
  const baseStyle =
    "inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "border-transparent bg-amber-400 text-black hover:bg-amber-500 focus:ring-amber-300",
    secondary: "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-400",
    danger: "border-transparent bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const mobileWidthClass = fullWidthMobile ? "w-full sm:w-auto" : "";

  return (
    <button {...rest} className={`${baseStyle} ${variants[variant]} ${mobileWidthClass} ${className}`}>
      {icon && <span className="mr-2 -ml-1 h-4 w-4">{icon}</span>}
      {children}
    </button>
  );
}

function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3 sm:py-4 first:pt-0 last:pb-0 gap-4">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <span className="text-xs sm:text-sm text-gray-500 leading-tight">{description}</span>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ${
          checked ? "bg-amber-400" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

/* --- SUB-SECTIONS --- */

interface ProfileSectionProps {
  user: UserData;
  updateUser: (updates: Partial<UserData>) => Promise<UserData>;
  openModal: () => void;
}

const ProfileSection = ({ user, updateUser, openModal }: ProfileSectionProps) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username ?? "");
      setEmail(user.email ?? "");
      setFullName(user.name ?? "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!username.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      await updateUser({ username, name: fullName });
      setMessage({ type: "success", text: "Changes saved!" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to save" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const avatarText = (user?.username || "U").slice(0, 2).toUpperCase();

  return (
    <SettingsCard icon={<UserIcon size={20} />} title="Profile" subtitle="Manage your info">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full bg-gray-100 ring-4 ring-white shadow-sm shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-2xl font-bold text-indigo-600">
                {avatarText}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto items-center sm:items-start">
             <Button variant="secondary" onClick={openModal} className="w-full sm:w-fit">Change Photo</Button>
             <p className="text-xs text-gray-500">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
          <InputField label="Full Name" id="fullname" value={fullName} onChange={setFullName} placeholder="John Doe" />
          <InputField label="Username" id="username" value={username} onChange={setUsername} placeholder="johndoe" />
          <div className="sm:col-span-2">
             <InputField label="Email" id="email" type="email" value={email} onChange={setEmail} disabled />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-6">
          <div className="text-sm w-full sm:w-auto text-center sm:text-left h-6">
            {message && (
              <span className={`flex items-center justify-center sm:justify-start gap-2 ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                {message.type === "success" ? <CheckCircle2 size={16}/> : <XCircle size={16}/>}
                {message.text}
              </span>
            )}
          </div>
          <Button variant="primary" icon={<Save size={16} />} onClick={handleSave} disabled={saving} fullWidthMobile>
            {saving ? "Saving..." : "Save Changes"}
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
    events: true
  });
  const [saving, setSaving] = useState(false);

  const toggle = (key: string) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 800);
  };

  return (
    <SettingsCard icon={<Bell size={20} />} title="Notifications" subtitle="Manage preferences">
      <div className="divide-y divide-gray-100">
        <Toggle 
          label="Email Notifications" 
          description="Receive updates via email"
          checked={settings.email} 
          onChange={() => toggle('email')} 
        />
        <Toggle 
          label="Push Notifications" 
          description="Real-time device notifications"
          checked={settings.push} 
          onChange={() => toggle('push')} 
        />
        <Toggle 
          label="Task Reminders" 
          description="Upcoming tasks alerts"
          checked={settings.tasks} 
          onChange={() => toggle('tasks')} 
        />
        <Toggle 
          label="Event Reminders" 
          description="Upcoming events alerts"
          checked={settings.events} 
          onChange={() => toggle('events')} 
        />
      </div>
      <div className="mt-6 flex justify-end border-t border-gray-100 pt-6">
        <Button variant="primary" onClick={handleSave} disabled={saving} fullWidthMobile>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </SettingsCard>
  );
};

const SecuritySection = () => {
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [error, setError] = useState("");

  const handleChange = (field: string, val: string) => setPasswords(prev => ({ ...prev, [field]: val }));

  const handleSubmit = () => {
    setError("");
    if (passwords.new !== passwords.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (passwords.new.length < 6) {
      setError("Min 6 characters");
      return;
    }
    alert("Password change logic would run here");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <SettingsCard icon={<Lock size={20} />} title="Security" subtitle="Password & security">
      <div className="flex flex-col gap-4">
        <InputField 
          label="Current Password" 
          id="current_pass" 
          type="password" 
          value={passwords.current} 
          onChange={(v) => handleChange("current", v)} 
          placeholder="Current password"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField 
            label="New Password" 
            id="new_pass" 
            type="password" 
            value={passwords.new} 
            onChange={(v) => handleChange("new", v)} 
            placeholder="New password"
          />
          <InputField 
            label="Confirm Password" 
            id="confirm_pass" 
            type="password" 
            value={passwords.confirm} 
            onChange={(v) => handleChange("confirm", v)} 
            placeholder="Confirm password"
          />
        </div>
        
        {error && <p className="text-sm text-red-600 flex items-center gap-2 bg-red-50 p-2 rounded"><AlertTriangle size={14}/> {error}</p>}

        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={handleSubmit} fullWidthMobile>Update Password</Button>
        </div>
      </div>
    </SettingsCard>
  );
};

const DangerZone = () => {
  return (
    <SettingsCard 
      icon={<AlertTriangle size={20} />} 
      title="Danger Zone" 
      subtitle="Irreversible actions" 
      danger={true}
    >
      <div className="rounded-lg border border-red-100 bg-red-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
          <p className="text-xs sm:text-sm text-red-700 mt-1">Permanently remove your account and data.</p>
        </div>
        <Button variant="danger" icon={<Trash2 size={16} />} onClick={() => window.confirm("Are you sure?")} fullWidthMobile>
          Delete Account
        </Button>
      </div>
    </SettingsCard>
  );
};

/* --- MAIN PAGE COMPONENT --- */

function SettingsContent() {
  const { user, updateUser } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openModal = () => {
    setFile(null); setPreview(null); setFileError(null); setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false); setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null); setFileError(null);
  };

  const validateAndSetFile = (f: File) => {
    const allowed = ["image/jpeg", "image/png", "image/gif"];
    if (!allowed.includes(f.type)) {
      setFileError("Format must be JPG, PNG, GIF");
      return false;
    }
    if (f.size > 2 * 1024 * 1024) {
      setFileError("File too big. Max 2MB.");
      return false;
    }
    setFileError(null); setFile(f);
    setPreview(URL.createObjectURL(f));
    return true;
  };

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndSetFile(f);
  };

  const handleSavePhoto = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      // In real app, upload file here and get URL
      const fakeUrl = preview || ""; 
      await updateUser({ avatarUrl: fakeUrl });
      setUploading(false);
      closeModal();
    } catch (err) {
      setUploading(false);
      setFileError("Upload failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">Manage your preferences and account settings.</p>
        </div>

        <div className="flex flex-col gap-4 sm:gap-8">
          <ProfileSection user={user} updateUser={updateUser} openModal={openModal} />
          <NotificationSection />
          <SecuritySection />
          <DangerZone />
        </div>
      </main>

      {/* Modal */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity" onClick={closeModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900">Change Profile Photo</h3>
                <button onClick={closeModal} className="rounded-full p-1 hover:bg-gray-100 transition-colors">
                  <XCircle size={24} className="text-gray-400" />
                </button>
              </div>

              <div 
                className="relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-8 sm:py-12 hover:bg-gray-100 transition-colors"
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => { 
                  e.preventDefault(); e.stopPropagation(); 
                  if(e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
                }}
              >
                  {preview ? (
                    <div className="relative h-32 w-32 sm:h-40 sm:w-40">
                        <img src={preview} className="h-full w-full rounded-full object-cover border-4 border-white shadow-md" alt="Preview" />
                        <button 
                          onClick={() => { setPreview(null); setFile(null); }}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600"
                        >
                          <XCircle size={16} />
                        </button>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-full bg-amber-100 p-3 sm:p-4">
                        <UserIcon size={32} className="text-amber-600" />
                      </div>
                      <div className="text-center px-4">
                        <p className="text-sm font-medium text-gray-900">
                          <label htmlFor="file-upload" className="cursor-pointer text-amber-600 hover:text-amber-500 hover:underline">
                            Click to upload
                          </label>
                          <span className="hidden sm:inline"> or drag and drop</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 2MB</p>
                      </div>
                      <input ref={fileInputRef} id="file-upload" type="file" className="hidden" accept="image/*" onChange={onFilePicked} />
                    </>
                  )}
              </div>

              {fileError && <p className="mt-3 text-sm text-red-600 text-center">{fileError}</p>}

              <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button variant="secondary" onClick={closeModal} fullWidthMobile>Cancel</Button>
                <Button variant="primary" onClick={handleSavePhoto} disabled={uploading || !file} fullWidthMobile>
                  {uploading ? "Uploading..." : "Save Photo"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <MockAuthProvider>
      <SettingsContent />
    </MockAuthProvider>
  );
}