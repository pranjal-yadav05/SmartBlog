// components/ui/blur-stack.jsx

const DEFAULT_BLUR_CONFIG = [
  { blur: 0.5, maskStops: [0, 12.5, 25, 37.5], zIndex: 1 },
  { blur: 1, maskStops: [12.5, 25, 37.5, 50], zIndex: 2 },
  { blur: 2, maskStops: [25, 37.5, 50, 62.5], zIndex: 3 },
  { blur: 4, maskStops: [37.5, 50, 62.5, 75], zIndex: 4 },
  { blur: 8, maskStops: [50, 62.5, 75, 87.5], zIndex: 5 },
  { blur: 16, maskStops: [62.5, 75, 87.5, 100], zIndex: 6 },
  { blur: 32, maskStops: [75, 87.5, 100, 100], zIndex: 7 },
  { blur: 64, maskStops: [87.5, 100, 100, 100], zIndex: 8 },
];

export default function BlurStack({
  className = "",
  config = DEFAULT_BLUR_CONFIG,
}) {
  return (
    <div className={className}>
      <div className="absolute inset-0 overflow-hidden">
        {config.map((layer, index) => {
          const [start, solidStart, solidEnd, end] = layer.maskStops;

          const maskImage = `
            linear-gradient(
              rgba(0,0,0,0) ${start}%,
              rgba(0,0,0,1) ${solidStart}%,
              rgba(0,0,0,1) ${solidEnd}%,
              rgba(0,0,0,0) ${end}%
            )
          `;

          return (
            <div
              key={index}
              className="pointer-events-none absolute inset-0"
              style={{
                zIndex: layer.zIndex,
                maskImage,
                WebkitMaskImage: maskImage,
                backdropFilter: `blur(${layer.blur}px)`,
                WebkitBackdropFilter: `blur(${layer.blur}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}