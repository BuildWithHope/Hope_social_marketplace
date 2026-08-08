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
      toast.success("Profile information updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile info.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in current password and new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      toast.success(res.message || "Password updated successfully!");

      // Reset form state
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.message || "Failed to change password. Please check your current password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = (profile.first_name?.[0] || profile.email?.[0] || "U").toUpperCase();

  return (
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

        {/* Personal Information */}
        <Card className="lg:col-span-2 border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
            <CardDescription>Update your personal name and contact details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>First name</Label>
                  <Input
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    className="bg-muted/40 text-xs"
                    placeholder="First Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Last name</Label>
                  <Input
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    className="bg-muted/40 text-xs"
                    placeholder="Last Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <Input
                    value={profile.email}
                    disabled
                    className="bg-muted/20 text-xs text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone Number</Label>
                  <Input
                    value={profile.phone_number}
                    onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                    className="bg-muted/40 text-xs"
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={profileSaving} size="sm" className="font-semibold cursor-pointer">
                  {profileSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Business Information */}
      <Card className="border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-base">Business & Organization Details</CardTitle>
          <CardDescription>Configure business info for invoices and account records.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Company Name</Label>
              <Input
                value={profile.company_name}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                className="bg-muted/40 text-xs"
                placeholder="e.g. HopeSocial Media Agency"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input
                defaultValue="Nigeria"
                disabled
                className="bg-muted/20 text-xs text-muted-foreground"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveProfile} disabled={profileSaving} size="sm" className="font-semibold cursor-pointer">
              Save Business Info
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security & Password Change */}
      <Card className="border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" /> Security & Password Update
          </CardTitle>
          <CardDescription>
            Change your account password. Once changed, your old password will immediately become invalid.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Current Password *</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-muted/40 text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>New Password *</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="bg-muted/40 text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm New Password *</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="bg-muted/40 text-xs"
                  required
                />
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
  );
}

