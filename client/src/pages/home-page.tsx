import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PawPrint, Users, Calendar } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Welcome, {user?.firstName}!</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/horses">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <PawPrint className="w-8 h-8 mb-2" />
                <CardTitle>Horses</CardTitle>
                <CardDescription>Manage horses and their information</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/calendar">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <Calendar className="w-8 h-8 mb-2" />
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Schedule and manage appointments</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/users">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <Users className="w-8 h-8 mb-2" />
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage users and roles</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}