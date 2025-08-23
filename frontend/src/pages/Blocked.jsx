import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Blocked = () => {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="max-w-lg w-full">
        <CardContent className="p-8 text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-semibold">Account Blocked</h1>
          <p className="text-sm text-muted-foreground">
            Your account {email ? <b>({email})</b> : null} has been blocked by the admin.
            If you believe this is a mistake, please contact support or the administrator.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link to="/support">
              <Button>Contact Support</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">Back to Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Blocked;
