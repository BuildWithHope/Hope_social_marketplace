"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

function Field({ label, defaultValue, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} type={type} className="bg-muted/40" />
    </div>
  );
}

export default function Profile() {
  return (
    <div>
      <PageHeader title="Profile" description="Manage your account, business details and security." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-base">Profile picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border border-border">
              <AvatarFallback className="bg-primary/15 text-primary text-2xl">HS</AvatarFallback>
            </Avatar>
            <div className="flex gap-2">
              <Button size="sm">Upload</Button>
              <Button size="sm" variant="outline" className="border-border/60">Remove</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-base">Personal information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" defaultValue="Hope" />
            <Field label="Last name" defaultValue="Adeyemi" />
            <Field label="Email" defaultValue="hope@example.com" type="email" />
            <Field label="Phone number" defaultValue="+234 801 234 5678" />
            <div className="sm:col-span-2 flex justify-end">
              <Button onClick={() => toast.success("Profile saved")}>Save changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-base">Business information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Company" defaultValue="HopeSocial Ltd." />
          <Field label="Website" defaultValue="https://hopesocial.io" />
          <Field label="Tax ID" defaultValue="—" />
          <Field label="Country" defaultValue="Nigeria" />
          <div className="sm:col-span-2 flex justify-end">
            <Button onClick={() => toast.success("Business info updated")}>Save business info</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-base">Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Current password" type="password" defaultValue="" />
            <Field label="New password" type="password" defaultValue="" />
            <Field label="Confirm new password" type="password" defaultValue="" />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => toast.success("Password updated")}>Update password</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
