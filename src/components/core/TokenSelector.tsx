'use client'

import { Token } from "@/network/types/token";
import { FC, useState, useMemo, useRef, useCallback } from "react";
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react"
import { useVirtualizer } from '@tanstack/react-virtual'

import { cn } from "@/utils"
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deferUntilNextTick } from "@/utils/deferUntilNextTick";

type TokenSelectorProps = {
  data: Record<string, Token>;
  isLoading: boolean;
  onSelect: (token: Token) => void;
  selectedToken: Token | null;
  compact?: boolean;
}

export const TokenSelector: FC<TokenSelectorProps> = ({
                                                        selectedToken,
                                                        onSelect,
                                                        isLoading,
                                                        data,
                                                        compact = false
                                                      }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const parentRef = useRef<HTMLDivElement>(null);

  const tokens = useMemo(() => {
    if (!data) {
      return []
    }

    const tokenArray = Object.values(data);

    if (!searchQuery) {
      return tokenArray
    }

    return tokenArray.filter(token =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const virtualizer = useVirtualizer({
    count: tokens.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10
  });

  const parentRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      parentRef.current = node;
      deferUntilNextTick(() => {
        virtualizer.measure();
      })
    }
  }, [virtualizer]);

  const handleTokenSelect = (token: Token) => {
    onSelect(token);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          role="combobox"
          className={cn(
            "w-full justify-between cursor-pointer border bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700",
            compact ? "min-h-[48px] p-2" : "min-h-[64px] p-3"
          )}
        >
          {selectedToken ? (
            <div className={cn("flex items-center", compact ? "space-x-2" : "space-x-3")}>
              <img
                src={selectedToken.logoURI}
                alt={selectedToken.name}
                className={cn("rounded-full", compact ? "w-6 h-6" : "w-8 h-8")}
              />
              {!compact && (
                <div className="flex flex-col items-start">
                  <span className="font-medium">{selectedToken.name}</span>
                  <span className="text-xs text-gray-500">{selectedToken.symbol}</span>
                </div>
              )}
              {compact && (
                <span className="font-medium text-sm">{selectedToken.symbol}</span>
              )}
            </div>
          ) : (
            <span className="text-gray-500">Select Token</span>
          )}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex items-center px-3 py-2 border-b border-neutral-700">
          <SearchIcon className="h-4 w-4 text-gray-500 mr-2"/>
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 p-0 text-sm"
          />
        </div>
        {isLoading ? (
          <div className="p-3 text-center text-gray-500 text-sm">
            Loading...
          </div>
        ) : tokens.length === 0 ? (
          <div className="p-3 text-center text-gray-500 text-sm">
            {searchQuery ? "Not found" : "No tokens"}
          </div>
        ) : (
          <div
            ref={parentRefCallback}
            className="h-[240px] overflow-auto"
            style={{ contain: 'strict' }}
          >
            <div
              style={{
                height: virtualizer.getTotalSize(),
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const token = tokens[virtualItem.index];
                const isSelected = selectedToken?.address === token.address;

                return (
                  <div
                    key={token.address}
                    className="absolute top-0 left-0 w-full"
                    style={{
                      height: virtualItem.size,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <div
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 cursor-pointer transition-colors hover:bg-neutral-800 border-b last:border-b-0",
                        isSelected && "bg-neutral-800"
                      )}
                      onClick={() => handleTokenSelect(token)}
                    >
                      <div className="relative">
                        <img
                          src={token.logoURI}
                          alt={token.name}
                          className="w-8 h-8 rounded-full"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white text-sm truncate">{token.name}</p>
                            <p className="text-xs text-gray-500">{token.symbol}</p>
                          </div>
                        </div>
                      </div>

                      <CheckIcon
                        className={cn(
                          "h-4 w-4 text-blue-600",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
