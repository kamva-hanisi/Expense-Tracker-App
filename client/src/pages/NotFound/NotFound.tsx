import { Link } from "react-router-dom";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const NotFound = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Page not found</h1>
        <p className="mt-3 text-sm text-slate-500">
          This route is not part of the expense tracker workspace.
        </p>
        <Link to="/">
          <Button className="mt-6">Back to dashboard</Button>
        </Link>
      </Card>
    </div>
  );
};

export default NotFound;
