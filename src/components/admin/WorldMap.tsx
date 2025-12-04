import { memo, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface VisitorLocation {
  country: string;
  countryCode: string;
  city: string;
  lat: number;
  lon: number;
  count: number;
}

interface WorldMapProps {
  locations: VisitorLocation[];
  totalVisits: number;
}

export const WorldMap = memo(({ locations, totalVisits }: WorldMapProps) => {
  // Group locations by coordinates to show count
  const groupedLocations = useMemo(() => {
    const grouped = new Map<string, VisitorLocation>();

    locations.forEach((loc) => {
      const key = `${loc.lat.toFixed(2)},${loc.lon.toFixed(2)}`;
      const existing = grouped.get(key);

      if (existing) {
        existing.count += loc.count;
      } else {
        grouped.set(key, { ...loc });
      }
    });

    return Array.from(grouped.values());
  }, [locations]);

  // Calculate marker size based on visit count
  const getMarkerSize = (count: number) => {
    const percentage = (count / totalVisits) * 100;
    if (percentage > 20) return 12;
    if (percentage > 10) return 10;
    if (percentage > 5) return 8;
    if (percentage > 2) return 6;
    return 4;
  };

  if (groupedLocations.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-zinc-500">
          <svg
            className="w-16 h-16 mx-auto mb-3 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm">No geographic data available</p>
          <p className="text-xs mt-1 text-zinc-600">
            Visit data will appear here once visitors are tracked
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 147,
          center: [0, 20],
        }}
        className="w-full h-full"
        style={{ backgroundColor: "transparent" }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#3f3f46"
                  stroke="#52525b"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: {
                      fill: "#52525b",
                      outline: "none",
                    },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {groupedLocations.map((location, index) => {
            const size = getMarkerSize(location.count);

            return (
              <Marker
                key={`${location.lat}-${location.lon}-${index}`}
                coordinates={[location.lon, location.lat]}
              >
                <g>
                  {/* Outer glow */}
                  <circle
                    r={size + 4}
                    fill="#3b82f6"
                    opacity={0.15}
                    className="animate-pulse"
                  />
                  {/* Middle ring */}
                  <circle r={size + 2} fill="#3b82f6" opacity={0.3} />
                  {/* Inner dot */}
                  <circle
                    r={size}
                    fill="#3b82f6"
                    stroke="#18181b"
                    strokeWidth={1.5}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />

                  {/* Tooltip on hover */}
                  <title>
                    {location.city}, {location.country}
                    {"\n"}
                    {location.count} {location.count === 1 ? "visit" : "visits"}
                    {"\n"}
                    {((location.count / totalVisits) * 100).toFixed(1)}% of total
                  </title>
                </g>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-lg p-2.5 shadow-lg">
        <div className="text-xs font-semibold mb-1.5 text-white">
          Visitor Density
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-zinc-400">&gt; 20%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-xs text-zinc-400">10-20%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs text-zinc-400">5-10%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-xs text-zinc-400">&lt; 5%</span>
          </div>
        </div>
      </div>

      {/* Total count */}
      <div className="absolute top-3 left-3 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-lg px-3 py-1.5 shadow-lg">
        <div className="text-xs text-zinc-400">Total Locations</div>
        <div className="text-xl font-bold text-white">
          {groupedLocations.length}
        </div>
      </div>
    </div>
  );
});

WorldMap.displayName = "WorldMap";
