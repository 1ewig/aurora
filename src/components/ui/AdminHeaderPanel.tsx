interface AdminHeaderPanelProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function AdminHeaderPanel({ title, description, action }: AdminHeaderPanelProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border-subtle pb-6">
      <div>
        <h1 className="font-display font-black text-3xl uppercase tracking-wider text-text-primary">
          {title}
        </h1>
        <p className="text-text-secondary text-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}
