import { Package, Star, TrendingUp } from "lucide-react";

export function CollectionStats() {
  const totalCards = 9;
  const uniqueCards = 9;
  const holograms = 3;

  const stats = [
    {
      label: "Total Cards",
      value: totalCards,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Unique Cards",
      value: uniqueCards,
      icon: Star,
      color: "text-secondary",
      bgColor: "bg-secondary/20",
    },
    {
      label: "Rare & Holos",
      value: holograms,
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-card border-2 border-border rounded-xl p-6 shadow-md
                       hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: "slideInUp 0.6s ease-out forwards",
              opacity: 0,
            }}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div
                  className="text-3xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
