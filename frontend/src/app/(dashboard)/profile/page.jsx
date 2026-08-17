"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, RefreshCw, Lock, CheckCircle2 } from "lucide-react";
import { getUserProfile, updateUserProfile, changePassword } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function Profile() {
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    company_name: "",
  });
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await getUserProfile();
        setProfile({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          phone_number: data.phone_number || "",
          company_name: data.company_name || "",
        });
      } catch (err) {
        toast.error("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateUserProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number,
        company_name: profile.company_name,
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = (profile.first_name?.[0] || profile.email?.[0] || "U").toUpperCase();

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <PageHeader title="Profile & Account Settings" description="Manage your personal details, business information, and account password security." />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Picture Card */}
          <Card className="border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-base">Account Identity</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 text-center">
              <Avatar className="h-24 w-24 border border-border/80 shadow-md">
                <AvatarFallback className="bg-primary/15 text-primary text-2xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm text-foreground">{profile.first_name || profile.last_name ? `${profile.first_name} ${profile.last_name}` : "Marketplace User"}</div>
                <div className="text-xs text-muted-foreground">{profile.email}</div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <Card className="lg:col-span-2 border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
              <CardDescription className="text-xs">Update your basic identity and contact information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="first_name" className="text-xs font-medium">First Name</Label>
                    <Input id="first_name" value={profile.first_name} onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))} className="bg-muted/40" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="last_name" className="text-xs font-medium">Last Name</Label>
                    <Input id="last_name" value={profile.last_name} onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))} className="bg-muted/40" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium">Email Address</Label>
                    <Input id="email" value={profile.email} disabled className="bg-muted/60 cursor-not-allowed opacity-75" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone_number" className="text-xs font-medium">Phone Number</Label>
                    <Input id="phone_number" value={profile.phone_number} onChange={(e) => setProfile((p) => ({ ...p, phone_number: e.target.value }))} className="bg-muted/40" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="company_name" className="text-xs font-medium">Company / Agency Name</Label>
                  <Input id="company_name" value={profile.company_name} onChange={(e) => setProfile((p) => ({ ...p, company_name: e.target.value }))} className="bg-muted/40" />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={profileSaving} size="sm" className="font-semibold cursor-pointer">
                    {profileSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...
                      </>
                    ) : (
                      "Save Profile"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Change Password Card */}
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" /> Security & Password Update
            </CardTitle>
            <CardDescription className="text-xs">Ensure your account uses a strong password to protect your funds.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
              <div className="space-y-1.5">
                <Label htmlFor="curr_pass" className="text-xs font-medium">Current Password</Label>
                <Input id="curr_pass" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="bg-muted/40" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="new_pass" className="text-xs font-medium">New Password</Label>
                  <Input id="new_pass" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="bg-muted/40" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm_pass" className="text-xs font-medium">Confirm New Password</Label>
                  <Input id="confirm_pass" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="bg-muted/40" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={passwordLoading} size="sm" className="font-semibold cursor-pointer">
                  {passwordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
