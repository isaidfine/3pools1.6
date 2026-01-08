import React from 'react';
import { Sparkles, Trash2, ArrowLeftRight, Check, ChevronsUp, X, Ban, ShoppingBag, Lock, Star } from 'lucide-react';

export const InventorySlot = ({
    item,
    index,
    isPendingSlot = false,
    isSelected,
    isTarget,
    isHovered, // External hover state control if needed, though we use local onMouseEnter
    isReference, // For "trade-in" selection etc
    onClick,
    onMouseEnter,
    onMouseLeave,

    // Context flags
    isSubmitMode,
    isRecycleMode,
    isSelectionMode,

    // Derived state for visuals
    isNeededForOrder,
    isMaxSatisfied,

    // Specific mechanic flags
    canSynthesize,
    isSterile,
    isOverloadTarget,

    // Style overrides

    // Style overrides
    className = ""
}) => {

    const isMultiSelectMode = isSubmitMode || isRecycleMode;
    const isTradeInMode = isSelectionMode; // Renamed param for clarity if passed as boolean, assuming referencing standard selectionMode check

    let actionType = null;

    // Determine Action Type for Overlay
    if (!isMultiSelectMode && !isTradeInMode && isHovered && isTarget) {
        // Logic from legacy code needs access to full inventory or parent passing down the context
        // Since we accepted `canSynthesize` as prop, we can simplify but the logic was:
        // if (pendingItem) -> if (params) synthesize else replace
        // if (selectedSlot) -> if (params) synthesize else swap

        // We'll rely on props passed from GameCore for `actionType` or derive it if we have enough info.
        // Current props: canSynthesize (boolean), isTarget (boolean).

        // Let's infer actionType from isTarget + canSynthesize + external context
        if (canSynthesize) {
            actionType = 'synthesize';
        } else if (isReference) { // Is reference for trade in? No, waits.
            // no op
        } else {
            // If we have a pending item (how do we know? isPendingSlot isn't it)
            // We need a way to know if we are holding something.
            // In GameCore we have `pendingItem` and `selectedSlot`.
            // If `isTarget` is true, it means we have something selected (slot or pending).

            // We need to differentiate 'switch position' vs 'replace pending'.
            // However, for visual purposes 'swap' icon is fine for both generally, 
            // unless it's pending replacing an item, which gives money back ('replace').
            // To be precise we might need an extra prop `actionType` from parent.

            // Fallback visual:
            actionType = 'swap';
        }
    }

    // We will assume the parent passes specific `actionType` if they want precise 'replace' vs 'swap'
    // But currently GameCore calculates `canSynthesize`.
    // Let's add an explicit `actionType` prop to InventorySlot to be safe, but for now modify logic:
    // If canSynthesize is true, show upgrade.
    // If isTarget is true and NOT synthesize, show swap/interaction.

    const isDisabled = (isMultiSelectMode && !item) || (isReference && (!item || item.isMainlineItem)) || isPendingSlot;

    return (
        <button
            onClick={() => !isDisabled && onClick(index)}
            onMouseEnter={() => onMouseEnter(index, item)}
            onMouseLeave={onMouseLeave}
            aria-disabled={isDisabled}
            title={item ? `${item.rarity?.name || ''} ${item.name}${item.sterile ? ' (绝育)' : ''}` : ''}
            className={`
                relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 select-none overflow-visible
                ${item
                    ? `${item.rarity?.color || 'bg-slate-100 border-slate-300'} ${item.rarity?.shadow || ''} shadow-sm`
                    : 'bg-slate-50 border-dashed border-slate-200'
                }
                ${!isMultiSelectMode && !isTradeInMode && isSelected ? '-translate-y-4 scale-110 z-10 shadow-xl ring-2 ring-blue-400' : ''}
                ${!isMultiSelectMode && !isTradeInMode && isTarget && isPendingSlot ? 'animate-pulse ring-2 ring-red-400 cursor-pointer hover:bg-red-50' : ''} 
                ${!isMultiSelectMode && !isTradeInMode && isTarget && !isPendingSlot ? 'hover:border-blue-300 cursor-pointer' : ''}
                ${!isMultiSelectMode && canSynthesize && isTarget ? 'ring-4 ring-yellow-400 scale-105 z-20' : ''}
                ${!isMultiSelectMode && !canSynthesize && isTarget ? 'hover:scale-105' : ''}

                ${isMultiSelectMode && item && !isPendingSlot ? 'cursor-pointer hover:scale-105' : ''}
                ${isSelected && isSubmitMode ? 'border-blue-600 bg-blue-50 border-2 z-10' : ''}
                ${isSelected && isRecycleMode ? 'border-amber-600 bg-amber-50 border-2 z-10' : ''}
                ${isMultiSelectMode && !isSelected && item && !isPendingSlot ? 'opacity-70 hover:opacity-100 grayscale-[0.3]' : ''}
                ${className}
            `}
        >
            {isPendingSlot && !item && (
                <div className="text-slate-300 font-bold text-xs uppercase tracking-widest">In Queue</div>
            )}

            {item && (
                <>
                    <div className={`flex flex-col items-center justify-center w-full h-full ${item.sterile || (item.decay !== undefined && item.decay <= 0) ? 'grayscale opacity-70' : ''}`}>
                        <span className="text-2xl lg:text-3xl filter drop-shadow-sm transition-transform duration-300">
                            {item.icon}
                        </span>
                        <span className="text-[10px] font-bold leading-none truncate max-w-full px-1">{item.name}</span>
                        {item.rarity?.bonus > 0 && (
                            <div className="absolute top-0 right-0 p-0.5 bg-white/50 rounded-bl-lg">
                                <Star size={8} fill="currentColor" className={item.rarity?.color ? item.rarity.color.split(' ')[2] : 'text-slate-400'} />
                            </div>
                        )}
                    </div>

                    {/* Status Icons */}
                    {item.sterile && (
                        <div className="absolute bottom-0 left-0 p-0.5 bg-gray-800/80 rounded-tr-lg text-white z-10 text-[9px] px-1 font-bold">
                            绝育的
                        </div>
                    )}

                    {/* Entropy Decay Indicator */}
                    {item.decay !== undefined && (
                        <>
                            <div className={`absolute top-0 left-0 p-0.5 rounded-br-lg text-[9px] font-mono font-bold z-10 px-1 leading-none
                                ${item.decay <= 0 ? 'bg-red-600 text-white' : 'bg-slate-700/80 text-white'}
                            `}>
                                {item.decay <= 0 ? '损坏' : item.decay}
                            </div>
                            {item.decay <= 0 && (
                                <div className="absolute inset-0 bg-slate-500/30 rounded-xl z-20 flex items-center justify-center pointer-events-none">
                                    <Ban size={24} className="text-red-800 opacity-60" />
                                </div>
                            )}
                        </>
                    )}

                    {/* Select/Trash Overlay Icon */}
                    {isSelected && (isSubmitMode || isRecycleMode) && (
                        <div className={`absolute -top-2 -right-2 text-white rounded-full p-1 shadow-md z-20 animate-in zoom-in ${isRecycleMode ? 'bg-amber-600' : 'bg-blue-600'}`}>
                            {isRecycleMode ? <Trash2 size={16} /> : <Check size={16} strokeWidth={4} />}
                        </div>
                    )}

                    {/* Order Hint Checkmark */}
                    {item && isNeededForOrder && (
                        <div className={`
                            absolute -bottom-1 -right-1 text-white rounded-full p-0.5 shadow-md border-2 border-white z-10 
                            ${isMaxSatisfied ? 'bg-green-500' : 'bg-slate-300'}
                        `}>
                            <Check size={12} strokeWidth={4} />
                        </div>
                    )}

                    {/* Passive Hint (Upgrade Available) */}
                    {/* Logic moved to parent usually, but if canSynthesize passed as prop unrelated to target, we show hint */}
                    {/* For now simplified: if isTarget is false but canSynthesize is true, it implies "could synthesize" maybe? 
                        Actually "canSynthesize" prop usually means "if you drop here". 
                        The passive "bouncing arrow" logic is distinct. 
                        Let's rely on `showPassiveHint` prop if we add it, or re-implement logic here.
                    */}

                    {/* Action Overlays */}
                    {/* Overload Action Overlay (Shows on all matching items) */}
                    {!isMultiSelectMode && !isSelectionMode && isOverloadTarget && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/60 rounded-lg transition-opacity z-10 backdrop-blur-[1px]">
                            <Trash2 size={32} className="text-white drop-shadow-md" />
                            <span className="text-white text-[10px] font-black uppercase tracking-wider text-center px-1">回收</span>
                        </div>
                    )}

                    {/* Standard Action Overlays (Hover only) */}
                    {!isMultiSelectMode && !isSelectionMode && isHovered && isTarget && !isOverloadTarget && (
                        <>
                            {canSynthesize ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-400/80 rounded-lg transition-opacity z-10 backdrop-blur-[1px] animate-pulse">
                                    <ChevronsUp size={36} className="text-white drop-shadow-md" />
                                    <span className="text-white text-xs font-black uppercase tracking-wider">升级</span>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-blue-500/40 rounded-lg transition-opacity z-10 backdrop-blur-[1px]">
                                    <ArrowLeftRight size={32} className="text-white drop-shadow-md" />
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </button>
    );
};
