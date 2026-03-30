"use client"

import Image from "next/image"

const tabs = [
  {
    id: "elevate",
    title: "elevate",
    subtitle: "Comprehensive health plan powered by AI that covers it all",
    logo: "/elevate-logo.svg",
    badgeLogo: "/elevate-ai.svg", 
    width: 90,
    height: 25,
    isLogoHeader: true,
    hasAiBadge: true,
  },
  {
    id: "booster",
    title: "Activate Booster",
    subtitle: "Boost your coverage with super top-up",
    logo: "/activate-booster.svg", 
    sideIcon: "/ab-side-logo.svg", 
    width: 100,
    height: 30,
    isLogoHeader: true, 
    hasAiBadge: false,
  },
  {
    id: "combo",
    title: "Activate Booster (Combo)",
    subtitle: "High sum insured, low premium combo",
    logo: "/abc-side-logo.svg", 
    width: 40,
    height: 40,
    isLogoHeader: false,
    hasAiBadge: false,
  },
  {
    id: "protect",
    title: "Personal Protect",
    subtitle: "Financial support for life-impacting injuries",
    logo: "/pp-side-logo.svg", 
    width: 40,
    height: 40,
    isLogoHeader: false,
    hasAiBadge: false,
  },
];

interface FormTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function FormTabs({ activeTab, setActiveTab }: FormTabsProps) {
  return (
    <div className="grid grid-cols-4 bg-[#fcfcfc] border border-[#e5e5e5] rounded-t-[15px] overflow-hidden">
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`cursor-pointer p-5 flex flex-col transition-all duration-300 min-h-[120px] relative border-r border-[#eaeaea] last:border-r-0
            ${activeTab === tab.id 
              ? "bg-[#fff5ed] border-b-[4px] border-b-[#f36f21] z-10" 
              : "bg-white border-b-[4px] border-b-transparent hover:bg-[#fff5ed]/50"
            }
            ${index === 0 && activeTab === tab.id ? "rounded-tl-[15px]" : ""}
          `}
        >
          {/* Header Row - Fixed width to prevent title from hitting the icon */}
          <div className="h-[35px] flex items-center mb-2 max-w-[70%]">
            {tab.isLogoHeader ? (
              <Image 
                src={tab.logo} 
                alt={tab.title} 
                width={tab.width} 
                height={tab.height} 
                className="object-contain" 
                priority 
              />
            ) : (
              /* Adjusted font size to 1.4rem and leading to prevent breaking */
              <h3 className="font-semibold text-[1.4rem] leading-[1.2] text-[#282828] break-words">
                {tab.title}
              </h3>
            )}
          </div>

          <p className="text-[1.1rem] text-[#838383] leading-tight max-w-[160px]">
            {tab.subtitle}
          </p>

          {/* Right-side Icons */}
          <div className="absolute top-5 right-4 w-[45px] h-[45px]">
            {tab.hasAiBadge && tab.badgeLogo && (
              <Image src={tab.badgeLogo} alt="" fill className="object-contain" />
            )}
            
            {tab.id === "booster" && (tab as any).sideIcon && (
              <Image src={(tab as any).sideIcon} alt="" fill className="object-contain" />
            )}

            {!tab.isLogoHeader && tab.logo && (
               <Image src={tab.logo} alt="" fill className="object-contain" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}