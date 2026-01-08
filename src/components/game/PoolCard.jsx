import React, { useMemo } from 'react';
import { Coins, Ticket, Check, RefreshCw, Zap } from 'lucide-react';

const PoolCardBase = ({
    pool,
    gold,
    tickets,
    hasSkill,
    inventory = [], // Added inventory prop
    onDraw,
    onMouseEnter,
    onMouseLeave,
    isHovered,
    relevantRequirements = []
}) => {
    // Cost Calculation
    let finalCost = pool.cost;
    if (pool.currency === 'gold' && hasSkill('calculated') && gold < 10) {
        finalCost = Math.max(1, finalCost - 2);
    }
    if (pool.currency === 'gold' && hasSkill('vip_discount') && (pool.affixKey === 'precise' || pool.affixKey === 'targeted')) {
        finalCost = Math.max(0, finalCost - 1);
    }

    const canAfford = pool.currency === 'gold' ? gold >= finalCost : tickets >= finalCost;

    // Theme: Use the solid pastel color defined in constants (pool.color)
    const isMainline = pool.type === 'mainline';

    return (
        <button
            onClick={() => canAfford && onDraw(pool)}
            onMouseEnter={() => onMouseEnter(pool)}
            onMouseLeave={onMouseLeave}
            disabled={!canAfford}
            className={`
                relative w-full text-left group
                rounded-2xl border-2 p-4 transition-all duration-200
                transform-gpu will-change-transform backface-hidden subpixel-antialiased
                ${pool.color} 
                ${isHovered ? 'scale-[1.02] shadow-xl z-10 ring-4 ring-white/50' : 'shadow-sm hover:shadow-md'}
                ${!canAfford ? 'opacity-60 grayscale-[0.8]' : 'active:scale-95'}
                flex flex-col gap-3 min-h-[140px]
            `}
        >
            {/* Header: Name and Cost */}
            <div className="flex justify-between items-start w-full">
                <div className="flex items-center gap-2">
                    <span className="text-4xl filter drop-shadow-sm">{pool.icon}</span>
                    <div className="flex flex-col">
                        <span className="font-black text-lg leading-none opacity-90">{pool.name}</span>
                        {pool.affix && (
                            <span className="text-xs font-bold opacity-70 mt-1">{pool.affix.name}</span>
                        )}
                    </div>
                </div>

                {/* Cost Pill */}
                <div className={`
                    absolute top-3 right-3
                    flex items-center gap-2 px-4 py-2 rounded-full font-black text-xl border-2 shadow-md z-10
                    bg-white
                    ${!canAfford ? 'opacity-60 grayscale' : 'text-slate-800 border-slate-200'}
                `}>
                    {finalCost < pool.cost && (
                        <span className="line-through text-xs text-slate-400 mr-1">{pool.cost}</span>
                    )}
                    {finalCost === 0 ? '免费' : finalCost}
                    {pool.currency === 'gold'
                        ? <Coins size={22} className={canAfford ? "text-yellow-500" : "text-slate-400"} />
                        : <Ticket size={22} className={canAfford ? "text-pink-500" : "text-slate-400"} />
                    }
                </div>
            </div>

            {/* Content: Desc or Requirements */}
            <div className="flex-1 w-full">
                {isMainline ? (
                    <div className="flex flex-col gap-1 text-sm font-bold opacity-80 mt-1">
                        <p>🔥 主线目标: {pool.targetItem?.name}</p>
                        <p className="text-xs opacity-60">可能是 90% 普通物品...</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {pool.affix && (
                            <p className="text-xs opacity-75 leading-snug">{pool.affix.desc}</p>
                        )}

                        {/* Requirements matching hints - DYNAMIC STYLING */}
                        {relevantRequirements.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {relevantRequirements.map((req, i) => {
                                    const candidates = inventory.filter(item => item && item.name === req.name);
                                    candidates.sort((a, b) => b.rarity.bonus - a.rarity.bonus);
                                    const matchedItem = candidates[0];

                                    const hasItem = !!matchedItem;
                                    const isQualitySatisfied = matchedItem && matchedItem.rarity.bonus >= req.requiredRarity.bonus;

                                    const borderStyle = hasItem ? 'border-solid' : 'border-dashed';

                                    let bgColorClass = 'bg-white/90';
                                    let iconFilterClass = 'grayscale opacity-70';
                                    let textColorClass = 'text-slate-500';
                                    let borderColorClass = 'border-slate-300';

                                    if (hasItem && isQualitySatisfied) {
                                        bgColorClass = matchedItem.rarity.color;
                                        iconFilterClass = '';
                                        textColorClass = 'text-slate-700';
                                        borderColorClass = matchedItem.rarity.color.split(' ')[0];
                                    } else if (hasItem) {
                                        bgColorClass = 'bg-slate-50';
                                        borderColorClass = matchedItem.rarity.color.split(' ')[0];
                                    }

                                    return (
                                        <div key={i} className={`
                                            relative flex items-center gap-1 text-sm border-2 rounded px-2 py-1 transition-all duration-200 shadow-sm
                                            ${borderStyle} ${borderColorClass} ${bgColorClass} ${textColorClass}
                                        `}>
                                            <div className={`w-2 h-2 rounded-full ${req.requiredRarity.dotColor} shadow-sm border border-black/10 shrink-0`} title={`需要: ${req.requiredRarity.name}`}></div>
                                            <span className={`${iconFilterClass}`}>{req.icon}</span>
                                            <span className={`font-bold ${iconFilterClass} opacity-90`}>{req.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            // Preview items if no reqs
                            <div className="flex flex-wrap gap-2 mt-2 opacity-80">
                                {pool.items.slice(0, 4).map(item => (
                                    <div key={item.name} className="w-8 h-8 flex items-center justify-center bg-white/50 rounded-lg border border-white/40 text-lg shadow-sm">
                                        {item.icon}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </button>
    );
};
export const PoolCard = React.memo(PoolCardBase);
