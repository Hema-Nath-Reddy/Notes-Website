import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../lib/api";
import useAuth from "../hooks/useAuth";
import { AlertTriangle, Trash2, Shield, Database } from "lucide-react";

export default function DeleteAccount() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dataSummary, setDataSummary] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const CONFIRMATION_TEXT = "DELETE MY ACCOUNT";

  useEffect(() => {
    fetchDataSummary();
  }, []);

  async function fetchDataSummary() {
    try {
      const { data } = await api.get("/api/account/deletion-status");
      if (data?.ok) {
        setDataSummary(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch data summary:", err);
    }
  }

  async function handleDeleteAccount() {
    if (confirmText !== CONFIRMATION_TEXT) {
      toast.error("Please type the confirmation text exactly as shown");
      return;
    }

    try {
      setLoading(true);
      
      // Delete all user data from the backend
      const { data } = await api.delete("/api/account");
      
      if (data?.ok) {
        toast.success("Account and all data deleted successfully");
        
        // Clear local auth data
        localStorage.removeItem('auth');
        
        // Logout and redirect
        await logout();
        navigate("/");
      } else {
        toast.error(data?.error || "Failed to delete account");
      }
    } catch (err) {
      console.error("Account deletion error:", err);
      toast.error(err?.response?.data?.error || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Delete Account</h1>
        <p className="text-white/70">Please log in to access account settings.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6 max-w-2xl">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Delete Account</h1>
        <p className="text-white/70">Permanently delete your account and all associated data.</p>
      </header>

      {/* Warning Section */}
      <div className="glass rounded-lg p-6 border-l-4 border-red-500/50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-400 mt-1" size={20} />
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Warning: This action is irreversible</h2>
            <p className="text-white/70">
              Deleting your account will permanently remove all your data including:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-1 ml-4">
              <li>All your notes and their content</li>
              <li>All your tags and tag relationships</li>
              <li>Your account profile and settings</li>
              <li>All associated data and preferences</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Summary */}
      {dataSummary && (
        <div className="glass rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Database className="text-blue-400 mt-1" size={20} />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Your Data Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-light rounded p-3">
                  <div className="text-2xl font-bold text-white">{dataSummary.dataSummary.notes}</div>
                  <div className="text-sm text-white/70">Notes</div>
                </div>
                <div className="glass-light rounded p-3">
                  <div className="text-2xl font-bold text-white">{dataSummary.dataSummary.tags}</div>
                  <div className="text-sm text-white/70">Tags</div>
                </div>
              </div>
              <p className="text-sm text-white/70">
                Total items to be deleted: {dataSummary.dataSummary.totalItems}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Section */}
      {!showConfirmation ? (
        <div className="glass rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="text-yellow-400 mt-1" size={20} />
              <div>
                <h3 className="text-lg font-semibold text-white">Before you proceed</h3>
                <p className="text-white/70">
                  Make sure you have backed up any important notes or data you want to keep.
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowConfirmation(true)}
              className="w-full glass-button-primary px-4 py-3 text-white hover:bg-red-600/90 transition-all"
            >
              <Trash2 size={16} className="inline mr-2" />
              I understand, proceed to delete my account
            </button>
          </div>
        </div>
      ) : (
        <div className="glass rounded-lg p-6 border-l-4 border-red-500/50">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-400 mt-1" size={20} />
              <div>
                <h3 className="text-lg font-semibold text-white">Final Confirmation</h3>
                <p className="text-white/70">
                  To confirm account deletion, please type the following text exactly:
                </p>
                <div className="mt-2 p-2 glass-light rounded font-mono text-white">
                  {CONFIRMATION_TEXT}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmation" className="block text-sm font-medium text-white">
                Confirmation Text
              </label>
              <input
                id="confirmation"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type the confirmation text here"
                className="w-full glass-input px-3 py-2 rounded-lg text-white placeholder-white/50"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setConfirmText("");
                }}
                className="flex-1 glass-button px-4 py-3 text-white hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading || confirmText !== CONFIRMATION_TEXT}
                className="flex-1 glass-button-primary px-4 py-3 text-white hover:bg-red-600/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} className="inline mr-2" />
                    Delete Account Forever
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
