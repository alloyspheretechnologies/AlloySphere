export default function WorkspaceInnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No nav here — the outer (workspace) group layout handles TopNav + Sidebar.
  // This layout exists only as a pass-through for the route group.
  return <>{children}</>;
}
