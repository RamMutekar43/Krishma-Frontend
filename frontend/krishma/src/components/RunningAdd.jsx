import React from "react";
import { Droplet, Leaf, Star } from "lucide-react";

const RunningAd = () => {
  const items = [
    { text: "Pure & Fresh Milk", icon: <Droplet className="h-10 w-10 text-primary" /> },
    { text: "Eco-Friendly Packaging", icon: <Leaf className="h-10 w-10 text-green-600" /> },
    { text: "Trusted by Families", icon: <Star className="h-10 w-10 text-yellow-500" /> },
  ];

  return (
    <div className="w-full overflow-hidden bg-muted/20 py-6 mt-10">
      <div className="flex animate-marquee whitespace-nowrap">
        {Array(3)
          .fill("")
          .map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-6">
              {items.map((item, index) => (
                <React.Fragment key={index}>
                  <span className="text-3xl md:text-5xl font-bold text-primary flex items-center gap-3">
                    {item.icon} {item.text}
                  </span>
                </React.Fragment>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default RunningAd;
