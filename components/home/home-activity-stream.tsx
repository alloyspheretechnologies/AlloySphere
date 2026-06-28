"use client";

interface ActivityItem {
  id: string;
  action: string;
  entity_type: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  user_name?: string;
  user_avatar?: string | null;
}

const getActivityIcon = (action: string, entityType: string | null) => {
  if (action.includes("created") && entityType === "startup") return { icon: "rocket_launch", color: "text-emerald-400" };
  if (action.includes("applied") || entityType === "application") return { icon: "description", color: "text-blue-400" };
  if (action.includes("completed") && entityType === "task") return { icon: "check_circle", color: "text-emerald-400" };
  if (action.includes("milestone")) return { icon: "flag", color: "text-amber-400" };
  if (action.includes("joined") || action.includes("member")) return { icon: "group_add", color: "text-purple-400" };
  if (action.includes("post") || action.includes("update")) return { icon: "edit_note", color: "text-white/50" };
  if (action.includes("follow")) return { icon: "person_add", color: "text-blue-400" };
  return { icon: "bolt", color: "text-on-surface-variant" };
};

const formatAction = (action: string) => {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export default function HomeActivityStream({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-on-surface-variant">electric_bolt</span>
          Activity Stream
        </h3>
        <div className="text-center py-6">
          <span className="material-symbols-outlined text-[36px] text-on-surface-variant/30 mb-2 block">history</span>
          <p className="text-sm text-on-surface-variant">No recent activity in the ecosystem.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 md:p-6 rounded-2xl border border-white/10">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-on-surface-variant">electric_bolt</span>
        Activity Stream
        <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse ml-1"></span>
      </h3>
      <div className="space-y-1">
        {activities.slice(0, 8).map((activity, idx) => {
          const { icon, color } = getActivityIcon(activity.action, activity.entity_type);
          return (
            <div key={activity.id || idx} className="flex items-center gap-3 py-3 border-b border-white/[0.03] last:border-0">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <span className={`material-symbols-outlined text-[16px] ${color}`}>{icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-on-surface">
                  {activity.user_name && (
                    <span className="font-semibold text-white">{activity.user_name} </span>
                  )}
                  <span className="text-on-surface-variant">{formatAction(activity.action)}</span>
                </div>
              </div>
              <span className="text-[10px] text-on-surface-variant/50 shrink-0">
                {getRelativeTime(activity.created_at)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getRelativeTime(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}
